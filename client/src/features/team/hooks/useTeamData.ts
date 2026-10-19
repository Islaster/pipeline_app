import { useEffect, useState } from "react";
import type { TeamInvite, TeamMember } from "../../../../../shared/types/user";
import { fetchPendingInvites, fetchTeamMembers } from "../api/teamApi";

// Loads the pending invites and the member list, and reloads both on request.
export function useTeamData() {
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([fetchPendingInvites(), fetchTeamMembers()])
      .then(([loadedInvites, loadedMembers]) => {
        if (!isCurrent) return;
        setInvites(loadedInvites);
        setMembers(loadedMembers);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (isCurrent)
          setError(
            cause instanceof Error ? cause.message : "Could not load the team."
          );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [reloadCount]);

  return {
    invites,
    members,
    isLoading,
    error,
    reload: () => setReloadCount((count) => count + 1),
  };
}
