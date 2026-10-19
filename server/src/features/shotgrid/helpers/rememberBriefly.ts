import { shotgridConfig } from "../config/shotgridConfig";

const remembered = new Map<
  string,
  { result: Promise<unknown>; expiresAt: number }
>();

// Remembers a result for a short time so repeat views don't ask ShotGrid again.
// Requests that arrive while one is still loading share that same load.
export function rememberBriefly<T>(
  key: string,
  load: () => Promise<T>
): Promise<T> {
  const existing = remembered.get(key);
  if (existing && Date.now() < existing.expiresAt)
    return existing.result as Promise<T>;

  const result = load().catch((error: unknown) => {
    remembered.delete(key); // never remember a failure
    throw error;
  });
  remembered.set(key, {
    result,
    expiresAt: Date.now() + shotgridConfig.cacheSeconds * 1000,
  });
  return result;
}

// Drops every remembered result whose key starts with the prefix.
export function forgetRemembered(keyPrefix: string): void {
  for (const key of remembered.keys()) {
    if (key.startsWith(keyPrefix)) remembered.delete(key);
  }
}
