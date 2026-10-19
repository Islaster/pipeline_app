import type { _Object } from "@aws-sdk/client-s3";
import type { StoredFile } from "../../../../../shared/types/storedFile";
import { storageConfig } from "../config/storageConfig";

export function lastPathSegment(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? "";
}

// Returns null for entries that aren't real files (folder markers, placeholders).
export function toStoredFile(object: _Object): StoredFile | null {
  const key = object.Key;
  if (!key || key.endsWith("/")) return null;

  const name = lastPathSegment(key);
  if (isHiddenFile(name)) return null;

  return {
    key,
    name,
    sizeBytes: object.Size ?? 0,
    lastModified: object.LastModified?.toISOString() ?? "",
  };
}

function isHiddenFile(name: string): boolean {
  return (
    storageConfig.hiddenFileNames.includes(name) ||
    storageConfig.hiddenFilePrefixes.some((prefix) => name.startsWith(prefix))
  );
}
