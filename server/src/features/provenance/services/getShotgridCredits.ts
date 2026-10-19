import type { LineageCredit } from "../../../../../shared/types/provenance";
import {
  readField,
  readLinkedName,
  readLinks,
  readText,
} from "../../shotgrid/helpers/shotgridRecords";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";
import {
  parseProductionFileName,
  versionKey,
} from "../helpers/parseProductionFileName";

// Everything ShotGrid can tell us about who worked on each version of a shot.
// Versions are matched to tree nodes by their name, which follows the file naming pattern.
export async function getShotgridCredits(
  shotCode: string
): Promise<Map<string, LineageCredit>> {
  const versions = await searchShotgrid({
    entity: "versions",
    filters: [["entity.Shot.code", "is", shotCode]],
    fields: [
      "code",
      "user", // the Artist field
      "created_by",
      "sg_task",
      "sg_task.Task.task_assignees",
      "sg_status_list",
      "created_at",
      "description",
    ],
  });

  const credits = new Map<string, LineageCredit>();
  for (const version of versions) {
    const parsed = parseProductionFileName(
      readText(readField(version, "code")) ?? ""
    );
    if (!parsed) continue;

    credits.set(versionKey(parsed.step, parsed.version), {
      assignees: readLinks(readField(version, "sg_task.Task.task_assignees"))
        .filter((assignee) => assignee.type !== "Group")
        .map((assignee) => assignee.name),
      task: readLinkedName(readField(version, "sg_task")),
      artist: readLinkedName(readField(version, "user")),
      publishedBy: readLinkedName(readField(version, "created_by")),
      status: readText(readField(version, "sg_status_list")),
      createdAt: readText(readField(version, "created_at")),
      description: readText(readField(version, "description")),
    });
  }
  return credits;
}
