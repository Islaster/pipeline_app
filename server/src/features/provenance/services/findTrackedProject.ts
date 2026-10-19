import { readField, readText } from "../../shotgrid/helpers/shotgridRecords";
import { rememberBriefly } from "../../shotgrid/helpers/rememberBriefly";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";
import { provenanceConfig } from "../config/provenanceConfig";

export interface ProvenanceProject {
  id: number;
  name: string;
  isDefault: boolean; // the one from provenanceConfig.trackedProject
}

function matchesTracked(name: string | null, code: string | null): boolean {
  const wanted = provenanceConfig.trackedProject.trim().toLowerCase();
  return (
    (name ?? "").toLowerCase() === wanted ||
    (code ?? "").toLowerCase() === wanted
  );
}

// Every active ShotGrid project, with the configured one marked as the default.
export function listProvenanceProjects(): Promise<ProvenanceProject[]> {
  return rememberBriefly("provenance-projects", async () => {
    const records = await searchShotgrid({
      entity: "projects",
      filters: [
        ["archived", "is", false],
        ["is_template", "is", false],
      ],
      fields: ["name", "code"],
      sort: "name",
    });

    return records.map((project) => {
      const name = readText(readField(project, "name"));
      const code = readText(readField(project, "code"));
      return {
        id: project.id,
        name: name ?? `Project ${project.id}`,
        isDefault: matchesTracked(name, code),
      };
    });
  });
}

// The project id a request should use: the one asked for, else the configured default.
export async function resolveProvenanceProjectId(
  requestedId: number | null
): Promise<number | null> {
  const projects = await listProvenanceProjects();
  if (
    requestedId !== null &&
    projects.some((project) => project.id === requestedId)
  )
    return requestedId;
  return projects.find((project) => project.isDefault)?.id ?? null;
}
