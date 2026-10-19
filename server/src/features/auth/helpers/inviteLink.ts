import { authConfig } from "../config/authConfig";

const hourInMs = 60 * 60 * 1000;

//set expiration of invite link
export function nextInviteExpiry(): Date {
  return new Date(Date.now() + authConfig.inviteHours * hourInMs);
}

// The token sits after "#", which browsers never send to servers or put in server logs.
export function buildInviteLink(token: string): string {
  return `${authConfig.appUrl}/accept-invite#token=${token}`;
}
