import type { TaskCard } from "../../../../../shared/types/tasks";

interface TaskCardViewProps {
  task: TaskCard;
  showAssignees: boolean; // off on a personal board, where they're all you
  isSelected: boolean;
  onSelect: () => void;
}

function dueLabel(
  dueDate: string | null
): { text: string; isOverdue: boolean } | null {
  if (!dueDate) return null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    text: `Due ${new Date(dueDate).toLocaleDateString()}`,
    isOverdue: dueDate < today,
  };
}

export function TaskCardView({
  task,
  showAssignees,
  isSelected,
  onSelect,
}: TaskCardViewProps) {
  const due = dueLabel(task.dueDate);

  return (
    <article
      className={`task-card${isSelected ? " task-card--selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <header className="task-card__header">
        <strong
          className="task-card__entity"
          title={task.entityName ?? undefined}
        >
          {task.entityName ?? "—"}
        </strong>
        {task.sequence && (
          <span className="task-card__sequence">{task.sequence}</span>
        )}
      </header>
      <p className="task-card__name">
        {task.name}
        {task.step && task.step !== task.name && (
          <span className="task-card__step"> · {task.step}</span>
        )}
      </p>
      <footer className="task-card__footer">
        {showAssignees && (
          <span
            className="task-card__assignees"
            title={task.assignees.join(", ")}
          >
            {task.assignees.join(", ") || "Unassigned"}
          </span>
        )}
        {due && (
          <span
            className={`task-card__due${
              due.isOverdue ? " task-card__due--overdue" : ""
            }`}
          >
            {due.text}
          </span>
        )}
      </footer>
    </article>
  );
}
