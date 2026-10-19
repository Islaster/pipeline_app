import type { TaskStatusChange } from "../../../../../shared/types/tasks";
import { forgetRemembered } from "../../shotgrid/helpers/rememberBriefly";
import { updateShotgridRecord } from "../../shotgrid/services/updateShotgridRecord";
import { tasksConfig } from "../config/tasksConfig";
import { taskFieldList, toTaskCard } from "../helpers/toTaskCard";

export function isKnownStatus(code: string): boolean {
  return tasksConfig.statusColumns.some((column) => column.code === code);
}

// Moves one task to a status from the board's columns, and returns the updated task.
export async function setTaskStatus(
  taskId: number,
  status: string
): Promise<TaskStatusChange> {
  const record = await updateShotgridRecord(
    "tasks",
    taskId,
    { [tasksConfig.fields.status]: status },
    taskFieldList
  );
  forgetRemembered("sequence-tasks:"); // the board reloads fresh next time
  return { task: toTaskCard(record) };
}
