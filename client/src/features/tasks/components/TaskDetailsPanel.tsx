import { useState } from "react";
import type {
  TaskCard,
  TaskStatusColumn,
} from "../../../../../shared/types/tasks";
import { setTaskStatus } from "../api/tasksApi";

interface TaskDetailsPanelProps {
  task: TaskCard;
  columns: TaskStatusColumn[];
  canChangeStatus: boolean;
  queueRemaining: number; // how many more tasks are waiting in Other after this one
  onStatusChanged: (updated: TaskCard) => void;
  onClose: () => void;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function TaskDetailsPanel({
  task,
  columns,
  canChangeStatus,
  queueRemaining,
  onStatusChanged,
  onClose,
}: TaskDetailsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentLabel =
    columns.find((column) => column.code === task.status)?.label ??
    task.status ??
    "No status";
  const isInOther = !columns.some((column) => column.code === task.status);

  async function moveTo(status: string) {
    setError(null);
    setIsSaving(true);
    try {
      const change = await setTaskStatus(task.id, status);
      onStatusChanged(change.task);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not change the status."
      );
      setIsSaving(false);
    }
  }

  return (
    <aside className="task-panel">
      <header className="task-panel__header">
        <div>
          <h2>{task.entityName ?? "Task"}</h2>
          <p className="tasks-page__note">
            {task.name}
            {task.step && task.step !== task.name ? ` · ${task.step}` : ""}
            {task.sequence ? ` · ${task.sequence}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="task-panel__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      <dl className="task-panel__facts">
        <dt>Status</dt>
        <dd>{currentLabel}</dd>
        <dt>Assigned</dt>
        <dd>{task.assignees.join(", ") || "Unassigned"}</dd>
        <dt>Start</dt>
        <dd>{formatDate(task.startDate)}</dd>
        <dt>Due</dt>
        <dd>{formatDate(task.dueDate)}</dd>
        <dt>Project</dt>
        <dd>{task.project?.name ?? "—"}</dd>
        <dt>Updated</dt>
        <dd>
          {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "—"}
        </dd>
      </dl>

      {canChangeStatus && (
        <section>
          <h3 className="task-panel__section-title">Move to</h3>
          <div className="task-panel__statuses">
            {columns.map((column) => (
              <button
                type="button"
                key={column.code}
                disabled={isSaving || column.code === task.status}
                className={`task-panel__status${
                  column.code === task.status
                    ? " task-panel__status--current"
                    : ""
                }`}
                onClick={() => void moveTo(column.code)}
              >
                {column.label}
              </button>
            ))}
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {isInOther && queueRemaining > 0 && (
            <p className="tasks-page__note">
              {queueRemaining} more in Other. Moving this one opens the next.
            </p>
          )}
          {isInOther && queueRemaining === 0 && (
            <p className="tasks-page__note">This is the last task in Other.</p>
          )}
        </section>
      )}
    </aside>
  );
}
