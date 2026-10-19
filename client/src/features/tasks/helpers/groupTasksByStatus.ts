import type {
  TaskCard,
  TaskStatusColumn,
} from "../../../../../shared/types/tasks";

export interface StatusGroup {
  code: string | null; // null is the "other" column
  label: string;
  tasks: TaskCard[];
}

// Puts every task in its status column, with unknown statuses in a final "other" column.
// Within a column, soonest due date first; tasks with no date go last.
export function groupTasksByStatus(
  tasks: TaskCard[],
  columns: TaskStatusColumn[],
  otherLabel: string
): StatusGroup[] {
  const byCode = new Map<string, TaskCard[]>(
    columns.map((column) => [column.code, []])
  );
  const other: TaskCard[] = [];

  for (const task of tasks) {
    const column = task.status ? byCode.get(task.status) : undefined;
    (column ?? other).push(task);
  }

  const byDueDate = (first: TaskCard, second: TaskCard) =>
    (first.dueDate ?? "9999").localeCompare(second.dueDate ?? "9999");

  const groups: StatusGroup[] = columns.map((column) => ({
    code: column.code,
    label: column.label,
    tasks: (byCode.get(column.code) ?? []).sort(byDueDate),
  }));
  if (other.length > 0)
    groups.push({
      code: null,
      label: otherLabel,
      tasks: other.sort(byDueDate),
    });
  return groups;
}
