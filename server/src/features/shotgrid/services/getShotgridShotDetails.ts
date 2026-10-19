import type { ShotgridShotDetails } from "../../../../../shared/types/shotgrid";
import {
  readField,
  readFileUrl,
  readLinkedName,
  readLinks,
  readNumber,
  readText,
} from "../helpers/shotgridRecords";
import { searchShotgrid } from "./searchShotgrid";

// Everything the shot panel shows: the shot itself, its media, notes, and tasks.
export async function getShotgridShotDetails(
  shotId: number
): Promise<ShotgridShotDetails | null> {
  const thisShot = { type: "Shot", id: shotId };

  const [shots, versions, notes, tasks] = await Promise.all([
    searchShotgrid({
      entity: "shots",
      filters: [["id", "is", shotId]],
      fields: [
        "code",
        "sg_status_list",
        "sg_sequence",
        "description",
        "sg_cut_in",
        "sg_cut_out",
      ],
    }),
    searchShotgrid({
      entity: "versions",
      filters: [["entity", "is", thisShot]],
      fields: [
        "code",
        "image",
        "sg_uploaded_movie_mp4",
        "sg_status_list",
        "user",
        "created_at",
      ],
      sort: "-created_at",
    }),
    searchShotgrid({
      entity: "notes",
      filters: [["note_links", "is", thisShot]],
      fields: ["subject", "content", "user", "created_at"],
      sort: "-created_at",
    }),
    searchShotgrid({
      entity: "tasks",
      filters: [["entity", "is", thisShot]],
      fields: [
        "content",
        "step",
        "sg_status_list",
        "task_assignees",
        "start_date",
        "due_date",
      ],
    }),
  ]);

  const [shot] = shots;
  if (!shot) return null;

  return {
    id: shot.id,
    code: readText(readField(shot, "code")) ?? `Shot ${shot.id}`,
    sequence: readLinkedName(readField(shot, "sg_sequence")),
    status: readText(readField(shot, "sg_status_list")),
    description: readText(readField(shot, "description")),
    cutIn: readNumber(readField(shot, "sg_cut_in")),
    cutOut: readNumber(readField(shot, "sg_cut_out")),

    media: versions.map((version) => ({
      id: version.id,
      name: readText(readField(version, "code")) ?? `Version ${version.id}`,
      thumbnailUrl: readText(readField(version, "image")),
      movieUrl: readFileUrl(readField(version, "sg_uploaded_movie_mp4")),
      status: readText(readField(version, "sg_status_list")),
      createdBy: readLinkedName(readField(version, "user")),
      createdAt: readText(readField(version, "created_at")),
    })),

    notes: notes.map((note) => ({
      id: note.id,
      subject: readText(readField(note, "subject")),
      content: readText(readField(note, "content")),
      author: readLinkedName(readField(note, "user")),
      createdAt: readText(readField(note, "created_at")),
    })),

    tasks: tasks.map((task) => ({
      id: task.id,
      name: readText(readField(task, "content")) ?? "Task",
      step: readLinkedName(readField(task, "step")),
      status: readText(readField(task, "sg_status_list")),
      assignees: readLinks(readField(task, "task_assignees")).map(
        (assignee) => assignee.name
      ),
      startDate: readText(readField(task, "start_date")),
      dueDate: readText(readField(task, "due_date")),
    })),
  };
}
