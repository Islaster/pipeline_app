import type {
  CreatedInvite,
  NewInvite,
  User,
} from "../../../../../shared/types/user";
import { database } from "../../../database/database";
import { AuthError } from "../helpers/AuthError";
import { buildInviteLink, nextInviteExpiry } from "../helpers/inviteLink";
import { createSecretToken } from "../helpers/secretToken";
import { assertCanManageRole } from "../helpers/teamAccess";

// Saves the invite and returns its one-time link. No permission checks here.
export async function issueInvite(
  newInvite: NewInvite,
  invitedById: string | null
): Promise<CreatedInvite> {
  const email = newInvite.email.trim().toLowerCase();
  const { token, tokenHash } = createSecretToken();
  const expiresAt = nextInviteExpiry();

  // A new invite replaces any unused earlier one for the same person, so only the latest link works.
  await database.query(
    "DELETE FROM invites WHERE email = $1 AND accepted_at IS NULL",
    [email]
  );
  await database.query(
    `INSERT INTO invites (email, name, role, token_hash, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      email,
      newInvite.name.trim(),
      newInvite.role,
      tokenHash,
      invitedById,
      expiresAt,
    ]
  );

  return {
    inviteLink: buildInviteLink(token),
    expiresAt: expiresAt.toISOString(),
  };
}

// What creative leads and leads use: checks they may create this role first.
export async function createInvite(
  invitedBy: User,
  newInvite: NewInvite
): Promise<CreatedInvite> {
  assertCanManageRole(invitedBy, newInvite.role);

  const existing = await database.query(
    "SELECT 1 FROM users WHERE email = $1",
    [newInvite.email.trim().toLowerCase()]
  );
  if (existing.rowCount)
    throw new AuthError(409, "An account with that email already exists.");

  return issueInvite(newInvite, invitedBy.id);
}
