import { useState } from "react";
import type { CreatedInvite } from "../../../../shared/types/user";
import { useAuth } from "../auth/hooks/useAuth";
import {
  cancelInvite,
  deleteMember,
  renewInvite,
  setMemberActive,
  updateMember,
} from "./api/teamApi";
import { InviteForm } from "./components/InviteForm";
import { InviteLinkResult } from "./components/InviteLinkResult";
import { PendingInvitesList } from "./components/PendingInvitesList";
import { TeamMembersList } from "./components/TeamMembersList";
import { getCreatableRoles } from "./helpers/roles";
import { useTeamData } from "./hooks/useTeamData";
import "./team.css";

interface ShownInvite {
  invite: CreatedInvite;
  name: string;
  email: string;
}

export function TeamPage() {
  const { user, setUser } = useAuth();
  const team = useTeamData();
  const [shownInvite, setShownInvite] = useState<ShownInvite | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const creatableRoles = user ? getCreatableRoles(user.role) : [];

  if (!user || creatableRoles.length === 0) {
    return (
      <main className="team-page">
        <h1>Team</h1>
        <p className="team-page__intro">
          Only creative leads and leads can create accounts.
        </p>
      </main>
    );
  }

  // Runs a change, shows any error, and refreshes both lists afterwards.
  async function applyChange(change: () => Promise<void>) {
    setActionError(null);
    try {
      await change();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "That didn't work."
      );
      throw cause;
    } finally {
      team.reload();
    }
  }

  return (
    <main className="team-page">
      <h1>Team</h1>
      <p className="team-page__intro">
        Create an account by inviting someone, then copy the link and send it to
        them. They set their own password from the link.
      </p>

      <InviteForm
        creatableRoles={creatableRoles}
        onInviteCreated={(invite, person) => {
          setShownInvite({ invite, ...person });
          team.reload();
        }}
      />
      {shownInvite && (
        <InviteLinkResult
          key={shownInvite.invite.inviteLink}
          {...shownInvite}
        />
      )}

      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}
      {team.error && <p className="form-error">{team.error}</p>}
      {team.isLoading && <p className="team-page__intro">Loading the team…</p>}

      {!team.isLoading && !team.error && (
        <>
          <PendingInvitesList
            invites={team.invites}
            onRenew={(invite) =>
              void applyChange(async () => {
                const renewed = await renewInvite(invite.id);
                setShownInvite({
                  invite: renewed,
                  name: invite.name,
                  email: invite.email,
                });
              })
            }
            onCancel={(invite) => {
              const message = `Cancel the invite for ${invite.name}? Their link will stop working.`;
              if (!window.confirm(message)) return;
              void applyChange(() => cancelInvite(invite.id));
            }}
          />
          <TeamMembersList
            members={team.members}
            currentUserId={user.id}
            assignableRoles={creatableRoles}
            onSetActive={(member, isActive) => {
              const message = `Deactivate ${member.name}? They'll be signed out and unable to sign in.`;
              if (!isActive && !window.confirm(message)) return;
              void applyChange(async () => {
                await setMemberActive(member.id, isActive);
              });
            }}
            onEdit={(member, changes) =>
              applyChange(async () => {
                const updated = await updateMember(member.id, changes);
                // Editing yourself updates the name shown in the navbar too.
                if (updated.id === user.id)
                  setUser({
                    ...user,
                    name: updated.name,
                    email: updated.email,
                  });
              })
            }
            onDelete={(member) => {
              const message = `Delete ${member.name}'s account? This can't be undone.`;
              if (!window.confirm(message)) return;
              void applyChange(() => deleteMember(member.id));
            }}
          />
        </>
      )}
    </main>
  );
}
