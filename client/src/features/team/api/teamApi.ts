import type {
  CreatedInvite,
  NewInvite,
  TeamInvite,
  TeamMember,
  MemberChanges,
} from "../../../../../shared/types/user";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`/api/auth${path}`, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(details?.error ?? `Request failed (${response.status})`);
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export function createInvite(newInvite: NewInvite): Promise<CreatedInvite> {
  return request<CreatedInvite>("POST", "/invites", newInvite);
}

export function fetchPendingInvites(): Promise<TeamInvite[]> {
  return request<TeamInvite[]>("GET", "/invites");
}

export function cancelInvite(inviteId: string): Promise<void> {
  return request<void>("DELETE", `/invites/${inviteId}`);
}

export function renewInvite(inviteId: string): Promise<CreatedInvite> {
  return request<CreatedInvite>("POST", `/invites/${inviteId}/renew`);
}

export function fetchTeamMembers(): Promise<TeamMember[]> {
  return request<TeamMember[]>("GET", "/members");
}

export function setMemberActive(
  memberId: string,
  isActive: boolean
): Promise<TeamMember> {
  return request<TeamMember>("PATCH", `/members/${memberId}`, { isActive });
}

export function updateMember(
  memberId: string,
  changes: MemberChanges
): Promise<TeamMember> {
  return request<TeamMember>("PATCH", `/members/${memberId}/details`, changes);
}

export function deleteMember(memberId: string): Promise<void> {
  return request<void>("DELETE", `/members/${memberId}`);
}
