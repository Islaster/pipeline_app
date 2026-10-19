import type { LineageTask } from "../../../../../shared/types/provenance";

interface TaskDetailsProps {
  shotCode: string;
  task: LineageTask;
  onClose: () => void;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function TaskDetails({ shotCode, task, onClose }: TaskDetailsProps) {
  return (
    <aside className="version-details">
      <header className="version-details__header">
        <h2>
          {shotCode} · {task.step ?? task.name}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <h3>Worked on by</h3>
      <p>{task.assignees.join(", ") || "Nobody was assigned."}</p>

      <h3>Task</h3>
      <dl className="version-details__facts">
        <dt>Name</dt>
        <dd>{task.name}</dd>
        <dt>Step</dt>
        <dd>{task.step ?? "—"}</dd>
        <dt>Status</dt>
        <dd>{task.status ?? "—"}</dd>
        <dt>Start</dt>
        <dd>{formatDate(task.startDate)}</dd>
        <dt>Due</dt>
        <dd>{formatDate(task.dueDate)}</dd>
        <dt>Last updated</dt>
        <dd>
          {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "—"}
        </dd>
      </dl>
    </aside>
  );
}
