import type { ShotgridSequence } from "../../../../../shared/types/shotgrid";
import { readField, readText } from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// A project's sequences: a small, quick read that the rest of the board loads from.
export async function listShotgridSequences(
  projectId: number
): Promise<ShotgridSequence[]> {
  const records = await searchShotgrid({
    entity: "sequences",
    filters: [["project", "is", { type: "Project", id: projectId }]],
    fields: ["code"],
    sort: "code",
  });

  return records.map((record) => ({
    id: record.id,
    name: readText(readField(record, "code")) ?? `Sequence ${record.id}`,
  }));
}
