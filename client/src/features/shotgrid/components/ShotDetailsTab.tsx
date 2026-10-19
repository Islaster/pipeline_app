import type { ShotgridShotDetails } from "../../../../../shared/types/shotgrid";

export function ShotDetailsTab({ details }: { details: ShotgridShotDetails }) {
  const cutRange =
    details.cutIn !== null && details.cutOut !== null
      ? `${details.cutIn} – ${details.cutOut}`
      : "—";

  return (
    <div className="shot-panel__list">
      <h3 className="shot-panel__section-title">Assigned</h3>
      {details.tasks.length === 0 && (
        <p className="shotgrid-page__note">No tasks on this shot.</p>
      )}
      {details.tasks.map((task) => (
        <div key={task.id} className="shot-task">
          <span>
            {task.name}
            {task.step && (
              <span className="shot-panel__meta"> · {task.step}</span>
            )}
          </span>
          <span>{task.assignees.join(", ") || "Unassigned"}</span>
          {task.status && (
            <span className="shot-table__status">{task.status}</span>
          )}
        </div>
      ))}

      <h3 className="shot-panel__section-title">Shot</h3>
      <dl className="shot-panel__facts">
        <dt>Sequence</dt>
        <dd>{details.sequence ?? "—"}</dd>
        <dt>Status</dt>
        <dd>{details.status ?? "—"}</dd>
        <dt>Cut range</dt>
        <dd>{cutRange}</dd>
        <dt>Description</dt>
        <dd>{details.description ?? "—"}</dd>
      </dl>
    </div>
  );
}
