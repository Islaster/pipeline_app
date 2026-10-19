import type { ShotgridProject } from "../../../../../shared/types/shotgrid";
import { readText } from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// Active projects only: no archived projects and no templates.
export async function listShotgridProjects(): Promise<ShotgridProject[]> {
  const records = await searchShotgrid({
    entity: "projects",
    filters: [
      ["archived", "is", false],
      ["is_template", "is", false],
    ],
    fields: ["name", "sg_status"],
    sort: "name",
  });

  return records.map((record) => ({
    id: record.id,
    name: readText(record.attributes?.name) ?? `Project ${record.id}`,
    status: readText(record.attributes?.sg_status),
  }));
}
