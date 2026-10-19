import { useState } from "react";
import type {
  MemberChanges,
  TeamMember,
  UserRole,
} from "../../../../../shared/types/user";
import { roleLabels } from "../helpers/roles";
import { EditMemberForm } from "./EditMemberForm";

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  assignableRoles: UserRole[];
  onSetActive: (member: TeamMember, isActive: boolean) => void;
  onEdit: (member: TeamMember, changes: MemberChanges) => Promise<void>;
  onDelete: (member: TeamMember) => void;
}

export function TeamMembersList({
  members,
  currentUserId,
  assignableRoles,
  onSetActive,
  onEdit,
  onDelete,
}: TeamMembersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="team-section">
      <h2>Team members</h2>
      {members.length === 0 && (
        <p className="team-section__empty">No accounts yet.</p>
      )}
      {members.length > 0 && (
        <div className="team-row team-row--header">
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
          <span className="team-row__actions">Actions</span>
        </div>
      )}

      {members.map((member) => {
        const isSelf = member.id === currentUserId;

        if (member.id === editingId) {
          return (
            <EditMemberForm
              key={member.id}
              member={member}
              isSelf={isSelf}
              assignableRoles={assignableRoles}
              onSave={async (changes) => {
                await onEdit(member, changes);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <div key={member.id} className="team-row">
            <span className="team-row__person">
              <strong>
                {member.name}
                {isSelf && <span className="team-row__you">you</span>}
              </strong>
              <span className="team-row__detail">{member.email}</span>
            </span>
            <span>{roleLabels[member.role]}</span>
            <span
              className={`team-row__detail${
                member.isActive ? "" : " team-row__detail--warning"
              }`}
            >
              {member.isActive ? "Active" : "Deactivated"}
            </span>
            <span className="team-row__actions">
              <button type="button" onClick={() => setEditingId(member.id)}>
                Edit
              </button>
              {!isSelf && (
                <>
                  <button
                    type="button"
                    onClick={() => onSetActive(member, !member.isActive)}
                  >
                    {member.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                  <button
                    type="button"
                    className="team-row__danger"
                    onClick={() => onDelete(member)}
                  >
                    Delete
                  </button>
                </>
              )}
            </span>
          </div>
        );
      })}
    </section>
  );
}
