import type { ShotgridAssignedShot } from "../../../../../shared/types/shotgrid";
import {
  readField,
  readLink,
  readLinkedName,
  readLinks,
  readText,
} from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// One sequence's shots, each with the artists assigned to it.
// Every shot is returned, including ones nobody is assigned to.
export async function listShotgridSequenceShots(
  sequenceId: number
): Promise<ShotgridAssignedShot[]> {
  const thisSequence = { type: "Sequence", id: sequenceId };

  const [shots, assignedTasks] = await Promise.all([
    searchShotgrid({
      entity: "shots",
      filters: [["sg_sequence", "is", thisSequence]],
      fields: ["code", "sg_status_list", "sg_sequence"],
      sort: "code",
    }),
    searchShotgrid({
      entity: "tasks",
      filters: [
        ["entity.Shot.sg_sequence", "is", thisSequence],
        ["task_assignees", "is_not", null], // only tasks that have someone assigned
      ],
      fields: ["entity", "task_assignees"],
    }),
  ]);

  const artistsByShotId = new Map<number, Set<string>>();
  for (const task of assignedTasks) {
    const shot = readLink(readField(task, "entity"));
    if (!shot) continue;

    const artists = artistsByShotId.get(shot.id) ?? new Set<string>();
    for (const assignee of readLinks(readField(task, "task_assignees"))) {
      if (assignee.type !== "Group") artists.add(assignee.name); // people only
    }
    artistsByShotId.set(shot.id, artists);
  }

  return shots.map((shot) => ({
    id: shot.id,
    code: readText(readField(shot, "code")) ?? `Shot ${shot.id}`,
    sequence: readLinkedName(readField(shot, "sg_sequence")),
    status: readText(readField(shot, "sg_status_list")),
    artists: [...(artistsByShotId.get(shot.id) ?? [])].sort(),
  }));
}
