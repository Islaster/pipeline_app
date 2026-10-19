import type {
  LineageTask,
  ShotLatestMedia,
} from "../../../../../shared/types/provenance";
import {
  readField,
  readFileUrl,
  readLinkedName,
  readLinks,
  readText,
} from "../../shotgrid/helpers/shotgridRecords";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";
import { isReviewTask } from "../helpers/isReviewTask";
import { getShotReviewNotes, type ReviewNote } from "./getShotReviewNotes";

export interface TaskTrail {
  tasks: LineageTask[];
  isInTrackedProject: boolean;
  status: string | null;
  latestMedia: ShotLatestMedia | null;
  notes: ReviewNote[];
}

const emptyTrail: TaskTrail = {
  tasks: [],
  isInTrackedProject: false,
  status: null,
  latestMedia: null,
  notes: [],
};

// Every task on one shot, plus its latest media, if the shot belongs to the tracked project.
export async function getShotTaskTrail(
  shotCode: string,
  projectId: number
): Promise<TaskTrail> {
  const shots = await searchShotgrid({
    entity: "shots",
    filters: [
      ["code", "is", shotCode],
      ["project", "is", { type: "Project", id: projectId }],
    ],
    fields: ["code", "sg_status_list"],
  });
  const [shot] = shots;
  if (!shot) return emptyTrail;
  const thisShot = { type: "Shot", id: shot.id };

  const [taskRecords, versionRecords, notes] = await Promise.all([
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
        "updated_at",
      ],
    }),
    searchShotgrid({
      entity: "versions",
      filters: [["entity", "is", thisShot]],
      fields: ["code", "image", "sg_uploaded_movie_mp4", "user", "created_at"],
      sort: "-created_at",
    }),
    getShotReviewNotes(shot.id),
  ]);

  const tasks: LineageTask[] = taskRecords.map((task) => {
    const name = readText(readField(task, "content")) ?? "Task";
    const step = readLinkedName(readField(task, "step"));
    return {
      taskId: task.id,
      name,
      step,
      isReview: isReviewTask(name, step),
      status: readText(readField(task, "sg_status_list")),
      assignees: readLinks(readField(task, "task_assignees"))
        .filter((assignee) => assignee.type !== "Group")
        .map((assignee) => assignee.name),
      startDate: readText(readField(task, "start_date")),
      dueDate: readText(readField(task, "due_date")),
      updatedAt: readText(readField(task, "updated_at")),
    };
  });

  // Newest first was requested, but sorted here too in case ShotGrid ignores the sort.
  const [newest] = versionRecords.sort((first, second) =>
    (readText(readField(second, "created_at")) ?? "").localeCompare(
      readText(readField(first, "created_at")) ?? ""
    )
  );
  const latestMedia: ShotLatestMedia | null = newest
    ? {
        name: readText(readField(newest, "code")) ?? `Version ${newest.id}`,
        thumbnailUrl: readText(readField(newest, "image")),
        movieUrl: readFileUrl(readField(newest, "sg_uploaded_movie_mp4")),
        createdAt: readText(readField(newest, "created_at")),
        createdBy: readLinkedName(readField(newest, "user")),
      }
    : null;

  return {
    tasks,
    notes,
    isInTrackedProject: true,
    status: readText(readField(shot, "sg_status_list")),
    latestMedia,
  };
}
