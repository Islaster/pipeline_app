import { useState } from "react";
import type { TaskCard } from "../../../../../shared/types/tasks";
import { groupTasksByStatus } from "../helpers/groupTasksByStatus";
import { useBoardColumns } from "../hooks/useBoardColumns";
import { TaskCardView } from "./TaskCardView";
import { TaskDetailsPanel } from "./TaskDetailsPanel";

interface TaskBoardProps {
  tasks: TaskCard[];
  showAssignees: boolean;
  canChangeStatus?: boolean;
  onTaskChanged?: (updated: TaskCard) => void;
}

export function TaskBoard({
  tasks,
  showAssignees,
  canChangeStatus = false,
  onTaskChanged,
}: TaskBoardProps) {
  const { columns, otherLabel } = useBoardColumns();
  const groups = groupTasksByStatus(tasks, columns, otherLabel);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const otherTasks = groups.find((group) => group.code === null)?.tasks ?? [];
  const selected = tasks.find((task) => task.id === selectedId) ?? null;
  const selectedIsInOther =
    selected !== null && otherTasks.some((task) => task.id === selected.id);
  const queueRemaining = selectedIsInOther
    ? otherTasks.length -
      1 -
      otherTasks.findIndex((task) => task.id === selected?.id)
    : 0;

  // After a task leaves Other, open the next one still in Other, if any.
  function handleStatusChanged(updated: TaskCard) {
    const leftOther =
      selectedIsInOther &&
      columns.some((column) => column.code === updated.status);
    const nextInOther = leftOther
      ? otherTasks.find((task) => task.id !== updated.id) ?? null
      : null;

    onTaskChanged?.(updated);
    setSelectedId(nextInOther?.id ?? (leftOther ? null : updated.id));
  }

  return (
    <>
      <div className="task-board">
        {groups.map((group) => (
          <section key={group.code ?? "other"} className="task-column">
            <h2 className="task-column__title">
              {group.label}
              <span className="task-column__count">{group.tasks.length}</span>
            </h2>
            <div className="task-column__cards">
              {group.tasks.map((task) => (
                <TaskCardView
                  key={task.id}
                  task={task}
                  showAssignees={showAssignees}
                  isSelected={task.id === selectedId}
                  onSelect={() => setSelectedId(task.id)}
                />
              ))}
              {group.tasks.length === 0 && (
                <p className="task-column__empty">Nothing here</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <TaskDetailsPanel
          key={selected.id}
          task={selected}
          columns={columns}
          canChangeStatus={canChangeStatus}
          queueRemaining={queueRemaining}
          onStatusChanged={handleStatusChanged}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
