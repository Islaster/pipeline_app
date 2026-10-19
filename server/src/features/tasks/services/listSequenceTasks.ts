import type { TaskCard } from "../../../../../shared/types/tasks";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";
import { tasksConfig } from "../config/tasksConfig";
import { isShownTask, taskFieldList, toTaskCard } from "../helpers/toTaskCard";

// Every task on the shots of one sequence. Loaded a sequence at a time, like the shot board.
export async function listSequenceTasks(
  sequenceId: number
): Promise<TaskCard[]> {
  const records = await searchShotgrid({
    entity: "tasks",
    filters: [
      [tasksConfig.fields.sequence, "is", { type: "Sequence", id: sequenceId }],
    ],
    fields: taskFieldList,
  });

  return records.map(toTaskCard).filter(isShownTask);
}
