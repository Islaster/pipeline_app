import type { TaskCard } from "../../../../../shared/types/tasks";
import {
  readField,
  readLink,
  readLinkedName,
  readLinks,
  readText,
  type ShotgridRecord,
} from "../../shotgrid/helpers/shotgridRecords";
import { tasksConfig } from "../config/tasksConfig";

const { fields } = tasksConfig;

export const taskFieldList = Object.values(fields);

export function toTaskCard(record: ShotgridRecord): TaskCard {
  const project = readLink(readField(record, fields.project));
  const entity = readLink(readField(record, fields.entity));

  return {
    id: record.id,
    name: readText(readField(record, fields.name)) ?? "Task",
    step: readLinkedName(readField(record, fields.step)),
    status: readText(readField(record, fields.status)),
    entityName: entity?.name ?? null,
    entityType: entity?.type ?? null,
    sequence: readLinkedName(readField(record, fields.sequence)),
    project: project ? { id: project.id, name: project.name } : null,
    assignees: readLinks(readField(record, fields.assignees))
      .filter((assignee) => assignee.type !== "Group")
      .map((assignee) => assignee.name),
    startDate: readText(readField(record, fields.startDate)),
    dueDate: readText(readField(record, fields.dueDate)),
    updatedAt: readText(readField(record, fields.updatedAt)),
  };
}

export function isShownTask(task: TaskCard): boolean {
  return !task.status || !tasksConfig.hiddenStatuses.includes(task.status);
}
