import type {
  LineageCredit,
  LineageVersion,
  ShotLineage,
} from "../../../../../shared/types/provenance";
import { shotgridConfig } from "../../shotgrid/config/shotgridConfig";
import { rememberBriefly } from "../../shotgrid/helpers/rememberBriefly";
import { getFileIndex } from "../../storage/services/fileIndex";
import { provenanceConfig } from "../config/provenanceConfig";
import {
  parseProductionFileName,
  versionKey,
} from "../helpers/parseProductionFileName";
import { getShotgridCredits } from "./getShotgridCredits";
import { getShotTaskTrail, TaskTrail } from "./getShotTaskTrail";

interface BranchInProgress {
  step: string;
  vendor: string | null;
  versions: Map<number, LineageVersion>;
}

function isInApprovedFolder(key: string): boolean {
  const folders = key.split("/").slice(0, -1);
  return folders.some((folder) =>
    folder.toLowerCase().endsWith(provenanceConfig.approvedFolderSuffix)
  );
}

// Credits are a bonus: the tree still loads when ShotGrid is off or unreachable.
async function loadCredits(
  shotCode: string
): Promise<{ credits: Map<string, LineageCredit>; note: string | null }> {
  if (!shotgridConfig.isConfigured) {
    return {
      credits: new Map(),
      note: "ShotGrid isn't connected, so nobody is credited yet.",
    };
  }
  try {
    const credits = await rememberBriefly(`credits:${shotCode}`, () =>
      getShotgridCredits(shotCode)
    );
    return { credits, note: null };
  } catch (error) {
    console.error("Provenance credits failed:", error);
    return {
      credits: new Map(),
      note: "ShotGrid couldn't be reached, so credits are missing.",
    };
  }
}

// the file tree still loads when ShotGrid is off or the project isn't found.
async function loadTaskTrail(
  shotCode: string,
  projectId: number | null
): Promise<TaskTrail> {
  const none: TaskTrail = {
    tasks: [],
    notes: [],
    isInTrackedProject: false,
    status: null,
    latestMedia: null,
  };
  if (!shotgridConfig.isConfigured || projectId === null) return none;
  try {
    return await rememberBriefly(`task-trail:${projectId}:${shotCode}`, () =>
      getShotTaskTrail(shotCode, projectId)
    );
  } catch (error) {
    console.error("Provenance task trail failed:", error);
    return none;
  }
}

// Builds a shot's tree from storage file names: one branch per step, one node per version.
export async function getShotLineage(
  shotCode: string,
  projectId: number | null
): Promise<ShotLineage> {
  const { files, isReady } = getFileIndex();
  const namePrefix = shotCode.toLowerCase();
  const branches = new Map<string, BranchInProgress>();

  for (const file of files) {
    if (!file.name.toLowerCase().startsWith(namePrefix)) continue; // quick skip
    const parsed = parseProductionFileName(file.name);
    if (!parsed || parsed.shotCode !== shotCode) continue;

    const branchKey = `${parsed.step}|${parsed.vendor ?? ""}`;
    const branch = branches.get(branchKey) ?? {
      step: parsed.step,
      vendor: parsed.vendor,
      versions: new Map<number, LineageVersion>(),
    };
    branches.set(branchKey, branch);

    const version = branch.versions.get(parsed.version) ?? {
      version: parsed.version,
      label: parsed.versionLabel,
      files: [],
      isApproved: false,
      firstSeen: null,
      credit: null,
    };
    branch.versions.set(parsed.version, version);

    version.files.push(file);
    if (isInApprovedFolder(file.key)) version.isApproved = true;
    if (!version.firstSeen || file.lastModified < version.firstSeen) {
      version.firstSeen = file.lastModified;
    }
  }

  const [{ credits, note }, trail] = await Promise.all([
    loadCredits(shotCode),
    loadTaskTrail(shotCode, projectId),
  ]);

  return {
    shotCode,
    isIndexReady: isReady,
    shotgridNote: note,
    tasks: trail.tasks,
    isInTrackedProject: trail.isInTrackedProject,
    branches: [...branches.values()]
      .sort((first, second) => first.step.localeCompare(second.step))
      .map((branch) => ({
        step: branch.step,
        vendor: branch.vendor,
        versions: [...branch.versions.values()]
          .sort((first, second) => first.version - second.version)
          .map((version) => ({
            ...version,
            credit:
              credits.get(versionKey(branch.step, version.version)) ?? null,
          })),
      })),
    status: trail.status,
    latestMedia: trail.latestMedia,
    notes: trail.notes,
  };
}
