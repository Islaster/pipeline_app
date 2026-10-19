import type { TaskStatusColumn } from "../../../../../shared/types/tasks";

export const tasksConfig = {
  // The board's columns, in order. These are ShotGrid's default task statuses;
  // change the codes and labels to match your site's.
  statusColumns: [
    { code: "wtg", label: "Waiting" },
    { code: "rdy", label: "Ready" },
    { code: "ip", label: "In Progress" },
    { code: "rev", label: "Review" },
    { code: "fin", label: "Final" },
  ] as TaskStatusColumn[],
  otherColumnLabel: "Other",
  hiddenStatuses: ["omt"], // omitted tasks aren't shown

  // ShotGrid's standard Task fields. If your site renamed them, change them here.
  fields: {
    name: "content",
    step: "step",
    status: "sg_status_list",
    entity: "entity",
    sequence: "entity.Shot.sg_sequence",
    project: "project",
    assignees: "task_assignees",
    startDate: "start_date",
    dueDate: "due_date",
    updatedAt: "updated_at",
  },
};
