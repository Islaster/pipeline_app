import {
  readField,
  readLinkedName,
  readText,
} from "../../shotgrid/helpers/shotgridRecords";
import { rememberBriefly } from "../../shotgrid/helpers/rememberBriefly";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";

export interface ProjectShotList {
  sequences: string[]; // e.g. "006_HKA"
  shots: { code: string; sequence: string | null }[];
}

// Every shot in a ShotGrid project, with its sequence, remembered briefly.
export function listProjectShots(projectId: number): Promise<ProjectShotList> {
  return rememberBriefly(`provenance-shots:${projectId}`, async () => {
    const records = await searchShotgrid({
      entity: "shots",
      filters: [["project", "is", { type: "Project", id: projectId }]],
      fields: ["code", "sg_sequence"],
      sort: "code",
    });

    const shots = records.flatMap((record) => {
      const code = readText(readField(record, "code"));
      return code
        ? [{ code, sequence: readLinkedName(readField(record, "sg_sequence")) }]
        : [];
    });
    const sequences = [
      ...new Set(shots.flatMap((shot) => shot.sequence ?? [])),
    ].sort();
    return { sequences, shots };
  });
}
