import type {
  TeamMember,
  User,
  MemberChanges,
  UserRole,
} from "../../../../../shared/types/user";
import { database } from "../../../database/database";
import { AuthError } from "../helpers/AuthError";
import {
  assertCanManageRole,
  canManageRole,
  isValidId,
} from "../helpers/teamAccess";
import { isUserRole } from "../helpers/rolePermissions";

interface MemberRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

const uniqueViolationCode = "23505"; // Postgres: that email is already taken

function toTeamMember(row: MemberRow): TeamMember {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active,
  };
}

export async function listTeamMembers(actor: User): Promise<TeamMember[]> {
  const result = await database.query<MemberRow>(
    "SELECT id, email, name, role, is_active FROM users ORDER BY name"
  );
  return result.rows
    .filter((member) => canManageRole(actor, member.role))
    .map(toTeamMember);
}

// Deactivating blocks sign-in and signs the person out everywhere. Nothing is deleted.
export async function setMemberActive(
  actor: User,
  memberId: string,
  isActive: boolean
): Promise<TeamMember> {
  if (memberId === actor.id)
    throw new AuthError(400, "You can't deactivate your own account.");

  const result = isValidId(memberId)
    ? await database.query<MemberRow>(
        "SELECT id, email, name, role, is_active FROM users WHERE id = $1",
        [memberId]
      )
    : null;
  const member = result?.rows[0];
  if (!member) throw new AuthError(404, "That person wasn't found.");

  assertCanManageRole(actor, member.role);

  await database.query("UPDATE users SET is_active = $1 WHERE id = $2", [
    isActive,
    member.id,
  ]);
  if (!isActive)
    await database.query("DELETE FROM sessions WHERE user_id = $1", [
      member.id,
    ]);

  return toTeamMember({ ...member, is_active: isActive });
}

async function findMember(memberId: string): Promise<MemberRow> {
  const result = isValidId(memberId)
    ? await database.query<MemberRow>(
        "SELECT id, email, name, role, is_active FROM users WHERE id = $1",
        [memberId]
      )
    : null;
  const member = result?.rows[0];
  if (!member) throw new AuthError(404, "That person wasn't found.");
  return member;
}

// Name and email can be changed on anyone you manage, and on yourself.
// Role can be changed only on people you manage, never on yourself.
export async function updateMember(
  actor: User,
  memberId: string,
  changes: MemberChanges
): Promise<TeamMember> {
  const member = await findMember(memberId);
  const isSelf = member.id === actor.id;
  if (!isSelf) assertCanManageRole(actor, member.role);

  const name = changes.name?.trim() ?? member.name;
  const email = changes.email?.trim().toLowerCase() ?? member.email;
  if (!name) throw new AuthError(400, "A name is required.");
  if (!email.includes("@"))
    throw new AuthError(400, "A valid email is required.");

  let role = member.role;
  if (changes.role !== undefined && changes.role !== member.role) {
    if (isSelf) throw new AuthError(400, "You can't change your own role.");
    if (!isUserRole(changes.role))
      throw new AuthError(400, "That role isn't valid.");
    assertCanManageRole(actor, changes.role); // can't promote someone past what you may create
    role = changes.role;
  }

  try {
    await database.query(
      "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4",
      [name, email, role, member.id]
    );
  } catch (error) {
    if ((error as { code?: string }).code === uniqueViolationCode) {
      throw new AuthError(409, "Another account already uses that email.");
    }
    throw error;
  }

  return toTeamMember({ ...member, name, email, role });
}

// Removes the account for good, along with their sessions and any pending invite.
export async function deleteMember(
  actor: User,
  memberId: string
): Promise<void> {
  if (memberId === actor.id)
    throw new AuthError(400, "You can't delete your own account.");

  const member = await findMember(memberId);
  assertCanManageRole(actor, member.role);

  await database.query("DELETE FROM invites WHERE email = $1", [member.email]);
  await database.query("DELETE FROM users WHERE id = $1", [member.id]); // sessions cascade
}
