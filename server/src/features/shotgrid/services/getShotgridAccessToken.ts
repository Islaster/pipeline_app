import { shotgridConfig } from "../config/shotgridConfig";

interface AccessTokenResponse {
  access_token: string;
  expires_in: number; // seconds
}

const refreshEarlySeconds = 60; // get a new token shortly before the old one expires
let cachedToken: { value: string; expiresAt: number } | null = null;

// Signs in with the script name and key, and reuses the token until it's about to expire.
export async function getShotgridAccessToken(): Promise<string> {
  if (!shotgridConfig.isConfigured)
    throw new Error("ShotGrid credentials are not set");
  if (cachedToken && Date.now() < cachedToken.expiresAt)
    return cachedToken.value;

  const response = await fetch(
    `${shotgridConfig.siteUrl}${shotgridConfig.apiPath}/auth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: shotgridConfig.scriptName,
        client_secret: shotgridConfig.scriptKey,
      }),
    }
  );
  if (!response.ok)
    throw new Error(`ShotGrid sign-in failed (${response.status})`);

  const token = (await response.json()) as AccessTokenResponse;
  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + (token.expires_in - refreshEarlySeconds) * 1000,
  };
  return cachedToken.value;
}

// Forgets the saved token so the next call signs in again.
export function clearShotgridAccessToken(): void {
  cachedToken = null;
}
