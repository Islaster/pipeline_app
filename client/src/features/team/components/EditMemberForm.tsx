import { useState } from "react";
import type {
  MemberChanges,
  TeamMember,
  UserRole,
} from "../../../../../shared/types/user";
import { roleLabels } from "../helpers/roles";

interface EditMemberFormProps {
  member: TeamMember;
  isSelf: boolean;
  assignableRoles: UserRole[]; // roles the editor may give this person
  onSave: (changes: MemberChanges) => Promise<void>;
  onCancel: () => void;
}

export function EditMemberForm({
  member,
  isSelf,
  assignableRoles,
  onSave,
  onCancel,
}: EditMemberFormProps) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<UserRole>(member.role);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    await onSave({ name, email, role });
    setIsSaving(false);
  }

  return (
    <form
      className="team-row team-row--editing"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <span className="team-row__person">
        <input
          className="text-input"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="Name"
        />
        <input
          className="text-input"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-label="Email"
        />
      </span>
      <span>
        {isSelf ? (
          roleLabels[member.role] // your own role is read-only
        ) : (
          <select
            className="text-input"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            aria-label="Role"
          >
            {assignableRoles.map((option) => (
              <option key={option} value={option}>
                {roleLabels[option]}
              </option>
            ))}
          </select>
        )}
      </span>
      <span className="team-row__detail">
        {member.isActive ? "Active" : "Deactivated"}
      </span>
      <span className="team-row__actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </span>
    </form>
  );
}
