import type { ShotgridShot } from "../../../../../shared/types/shotgrid";
import { readLinkedName, readText } from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// These are ShotGrid's standard Shot fields. If your site renamed them, change them here.
const shotFields = {
  code: "code",
  status: "sg_status_list",
  sequence: "sg_sequence",
};

export async function listShotgridShots(
  projectId: number
): Promise<ShotgridShot[]> {
  const records = await searchShotgrid({
    entity: "shots",
    filters: [["project", "is", { type: "Project", id: projectId }]],
    fields: Object.values(shotFields),
    sort: shotFields.code,
  });

  return records.map((record) => ({
    id: record.id,
    code: readText(record.attributes?.[shotFields.code]) ?? `Shot ${record.id}`,
    sequence: readLinkedName(record.relationships?.[shotFields.sequence]),
    status: readText(record.attributes?.[shotFields.status]),
  }));
}
