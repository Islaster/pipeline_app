import {
  readField,
  readLink,
  readLinkedName,
  readLinks,
  readText,
} from "../../shotgrid/helpers/shotgridRecords";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";

export interface ReviewNote {
  taskId: number | null; // the task the note is attached to, when ShotGrid recorded one
  subject: string | null;
  content: string | null;
  author: string | null;
  createdAt: string | null;
}

// Every note on the shot, with the task it's tied to. Notes with no task go to the nearest review by date.
export async function getShotReviewNotes(
  shotId: number
): Promise<ReviewNote[]> {
  const records = await searchShotgrid({
    entity: "notes",
    filters: [["note_links", "is", { type: "Shot", id: shotId }]],
    fields: ["subject", "content", "user", "created_at", "tasks"],
    sort: "created_at",
  });

  return records.map((note) => {
    // A note can be linked to several tasks; the first one is the one it was written for.
    const [task] = readLinks(readField(note, "tasks"));
    return {
      taskId: task?.id ?? readLink(readField(note, "tasks"))?.id ?? null,
      subject: readText(readField(note, "subject")),
      content: readText(readField(note, "content")),
      author: readLinkedName(readField(note, "user")),
      createdAt: readText(readField(note, "created_at")),
    };
  });
}
