import type { ShotgridShotArtists } from "../../../../../shared/types/shotgrid";
import { readLink, readLinks } from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// For one project: which artists are assigned to each shot, read from the shots' tasks.
export async function listShotgridShotArtists(
  projectId: number
): Promise<ShotgridShotArtists[]> {
  const tasks = await searchShotgrid({
    entity: "tasks",
    filters: [
      ["project", "is", { type: "Project", id: projectId }],
      ["entity", "type_is", "Shot"],
    ],
    fields: ["entity", "task_assignees"],
  });

  const artistsByShotId = new Map<number, Set<string>>();
  for (const task of tasks) {
    const shot = readLink(task.relationships?.entity);
    if (!shot) continue;

    const artists = artistsByShotId.get(shot.id) ?? new Set<string>();
    for (const assignee of readLinks(task.relationships?.task_assignees)) {
      if (assignee.type !== "Group") artists.add(assignee.name); // people only
    }
    artistsByShotId.set(shot.id, artists);
  }

  return [...artistsByShotId]
    .filter(([, artists]) => artists.size > 0)
    .map(([shotId, artists]) => ({ shotId, artists: [...artists].sort() }));
}
