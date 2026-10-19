import type { TeamInvite } from "../../../../../shared/types/user";
import { roleLabels } from "../helpers/roles";

interface PendingInvitesListProps {
  invites: TeamInvite[];
  onRenew: (invite: TeamInvite) => void;
  onCancel: (invite: TeamInvite) => void;
}

export function PendingInvitesList({
  invites,
  onRenew,
  onCancel,
}: PendingInvitesListProps) {
  return (
    <section className="team-section">
      <h2>Pending invites</h2>
      {invites.length === 0 && (
        <p className="team-section__empty">No invites are waiting.</p>
      )}
      {invites.length > 0 && (
        <div className="team-row team-row--header">
          <span>Name</span>
          <span>Role</span>
          <span>Expires</span>
          <span className="team-row__actions">Actions</span>
        </div>
      )}
      {invites.map((invite) => (
        <div key={invite.id} className="team-row">
          <span className="team-row__person">
            <strong>{invite.name}</strong>
            <span className="team-row__detail">{invite.email}</span>
          </span>
          <span>{roleLabels[invite.role]}</span>
          <span
            className={`team-row__detail${
              invite.isExpired ? " team-row__detail--warning" : ""
            }`}
          >
            {invite.isExpired
              ? "Expired"
              : `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
            {invite.invitedBy ? ` · by ${invite.invitedBy}` : ""}
          </span>
          <span className="team-row__actions">
            <button type="button" onClick={() => onRenew(invite)}>
              New link
            </button>
            <button type="button" onClick={() => onCancel(invite)}>
              Cancel
            </button>
          </span>
        </div>
      ))}
    </section>
  );
}
