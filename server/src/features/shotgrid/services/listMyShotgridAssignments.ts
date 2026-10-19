import type {
  MyShotgridAssignments,
  ShotgridAssignment,
} from "../../../../../shared/types/shotgrid";
import { readLink, readLinkedName, readText } from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// ShotGrid's standard Task fields. If your site renamed them, change them here.
const taskFields = {
  name: "content",
  status: "sg_status_list",
  project: "project",
  entity: "entity", // the shot or asset the task is on
  sequence: "entity.Shot.sg_sequence", // that shot's sequence
  assignees: "task_assignees",
};

// People's ShotGrid ids don't change, so each successful lookup is remembered.
const shotgridUserIdsByName = new Map<string, number>();

// Returns the ids of every ShotGrid person with exactly this full name.
async function findShotgridUserIds(fullName: string): Promise<number[]> {
  const remembered = shotgridUserIdsByName.get(fullName);
  if (remembered !== undefined) return [remembered];

  const records = await searchShotgrid({
    entity: "human_users",
    filters: [["name", "is", fullName]],
    fields: ["name"],
  });

  const [onlyMatch] = records;
  if (records.length === 1 && onlyMatch)
    shotgridUserIdsByName.set(fullName, onlyMatch.id);
  return records.map((record) => record.id);
}

// Every task assigned to the ShotGrid person who has this full name.
export async function listMyShotgridAssignments(
  fullName: string
): Promise<MyShotgridAssignments> {
  const userIds = await findShotgridUserIds(fullName.trim());
  const [shotgridUserId] = userIds;

  // No match, or several people share the name: show nothing instead of guessing whose work it is.
  if (userIds.length !== 1 || shotgridUserId === undefined) {
    return { matchingShotgridUsers: userIds.length, assignments: [] };
  }

  const records = await searchShotgrid({
    entity: "tasks",
    filters: [
      [taskFields.assignees, "is", { type: "HumanUser", id: shotgridUserId }],
    ],
    fields: [
      taskFields.name,
      taskFields.status,
      taskFields.project,
      taskFields.entity,
      taskFields.sequence,
    ],
  });

  const assignments: ShotgridAssignment[] = records.map((record) => {
    const project = readLink(record.relationships?.[taskFields.project]);
    const entity = readLink(record.relationships?.[taskFields.entity]);
    const sequence =
      record.relationships?.[taskFields.sequence] ??
      record.attributes?.[taskFields.sequence];

    return {
      taskId: record.id,
      taskName: readText(record.attributes?.[taskFields.name]) ?? "Task",
      status: readText(record.attributes?.[taskFields.status]),
      project: project ? { id: project.id, name: project.name } : null,
      entityName: entity?.name ?? null,
      entityType: entity?.type ?? null,
      sequence: readLinkedName(sequence),
    };
  });

  return { matchingShotgridUsers: 1, assignments };
}
