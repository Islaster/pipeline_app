import type {
  CreatedInvite,
  TeamInvite,
  User,
  UserRole,
} from "../../../../../shared/types/user";
import { database } from "../../../database/database";
import { AuthError } from "../helpers/AuthError";
import { buildInviteLink, nextInviteExpiry } from "../helpers/inviteLink";
import { createSecretToken } from "../helpers/secretToken";
import {
  assertCanManageRole,
  canManageRole,
  isValidId,
} from "../helpers/teamAccess";

interface InviteRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  expires_at: Date;
  invited_by_name: string | null;
}

const pendingInvitesQuery = `
  SELECT invites.id, invites.email, invites.name, invites.role, invites.expires_at,
         inviter.name AS invited_by_name
    FROM invites
    LEFT JOIN users AS inviter ON inviter.id = invites.invited_by
   WHERE invites.accepted_at IS NULL`;

// Invites that haven't been accepted yet, including expired ones so they can be renewed.
export async function listPendingInvites(actor: User): Promise<TeamInvite[]> {
  const result = await database.query<InviteRow>(
    `${pendingInvitesQuery} ORDER BY invites.created_at DESC`
  );

  return result.rows
    .filter((invite) => canManageRole(actor, invite.role))
    .map((invite) => ({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      role: invite.role,
      invitedBy: invite.invited_by_name,
      expiresAt: invite.expires_at.toISOString(),
      isExpired: invite.expires_at.getTime() < Date.now(),
    }));
}

async function findManageableInvite(
  actor: User,
  inviteId: string
): Promise<InviteRow> {
  const result = isValidId(inviteId)
    ? await database.query<InviteRow>(
        `${pendingInvitesQuery} AND invites.id = $1`,
        [inviteId]
      )
    : null;
  const invite = result?.rows[0];
  if (!invite) throw new AuthError(404, "That invite no longer exists.");

  assertCanManageRole(actor, invite.role);
  return invite;
}

// The link stops working immediately.
export async function cancelInvite(
  actor: User,
  inviteId: string
): Promise<void> {
  const invite = await findManageableInvite(actor, inviteId);
  await database.query(
    "DELETE FROM invites WHERE id = $1 AND accepted_at IS NULL",
    [invite.id]
  );
}

// Gives the invite a fresh link and expiry. The old link stops working.
export async function renewInvite(
  actor: User,
  inviteId: string
): Promise<CreatedInvite> {
  const invite = await findManageableInvite(actor, inviteId);
  const { token, tokenHash } = createSecretToken();
  const expiresAt = nextInviteExpiry();

  await database.query(
    "UPDATE invites SET token_hash = $1, expires_at = $2 WHERE id = $3",
    [tokenHash, expiresAt, invite.id]
  );

  return {
    inviteLink: buildInviteLink(token),
    expiresAt: expiresAt.toISOString(),
  };
}
