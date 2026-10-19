export type UserRole = "creative_lead" | "lead" | "artist";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface NewInvite {
  email: string;
  name: string;
  role: UserRole;
}

export interface CreatedInvite {
  inviteLink: string; // the creator copies this and sends it to the new person
  expiresAt: string;
}

// What the accept-invite screen shows about a pending invite.
export type InviteDetails = NewInvite;

export interface TeamInvite {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  invitedBy: string | null;
  expiresAt: string;
  isExpired: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface MemberChanges {
  name?: string;
  email?: string;
  role?: UserRole;
}
