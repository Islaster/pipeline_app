import type { MyTasks } from "../../../../../shared/types/tasks";
import { searchShotgrid } from "../../shotgrid/services/searchShotgrid";
import { tasksConfig } from "../config/tasksConfig";
import { isShownTask, taskFieldList, toTaskCard } from "../helpers/toTaskCard";

// People's ShotGrid ids don't change, so each successful lookup is remembered.
const shotgridUserIdsByName = new Map<string, number>();

async function findShotgridUserIds(fullName: string): Promise<number[]> {
  const remembered = shotgridUserIdsByName.get(fullName);
  if (remembered !== undefined) return [remembered];

  const records = await searchShotgrid({
    entity: "human_users",
    filters: [["name", "is", fullName]],
    fields: ["name"],
  });

  const [onlyMatch] = records;
  if (records.length === 1 && onlyMatch)
    shotgridUserIdsByName.set(fullName, onlyMatch.id);
  return records.map((record) => record.id);
}

// Every task assigned to the ShotGrid person with this full name.
export async function listMyTasks(fullName: string): Promise<MyTasks> {
  const userIds = await findShotgridUserIds(fullName.trim());
  const [shotgridUserId] = userIds;
  if (userIds.length !== 1 || shotgridUserId === undefined) {
    return { matchingShotgridUsers: userIds.length, tasks: [] };
  }

  const records = await searchShotgrid({
    entity: "tasks",
    filters: [
      [
        tasksConfig.fields.assignees,
        "is",
        { type: "HumanUser", id: shotgridUserId },
      ],
    ],
    fields: taskFieldList,
  });

  return {
    matchingShotgridUsers: 1,
    tasks: records.map(toTaskCard).filter(isShownTask),
  };
}
