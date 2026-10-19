import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { StoredFile } from "../../../../../shared/types/storedFile";
import { s3Client } from "../config/s3Client";
import { storageConfig } from "../config/storageConfig";
import { lastPathSegment, toStoredFile } from "../helpers/toStoredFile";
import {
  loadCachedIndex,
  saveCachedIndex,
  type BucketContents,
} from "./fileIndexCache";

let indexed: BucketContents = { files: [], folders: [] };
let isReady = false;
let isRefreshing = false;

// "Assets/Characters/sheet.png" adds "Assets/" and "Assets/Characters/".
function addParentFolders(key: string, folderPaths: Set<string>): void {
  let slashIndex = key.indexOf("/");
  while (slashIndex !== -1) {
    folderPaths.add(key.slice(0, slashIndex + 1));
    slashIndex = key.indexOf("/", slashIndex + 1);
  }
}

async function loadBucketContents(): Promise<BucketContents> {
  const files: StoredFile[] = [];
  const folderPaths = new Set<string>();
  let cursor: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: storageConfig.bucket,
        ContinuationToken: cursor,
      })
    );
    for (const object of response.Contents ?? []) {
      // Folder markers and placeholders aren't files, but they still reveal folders.
      if (object.Key) addParentFolders(object.Key, folderPaths);
      const file = toStoredFile(object);
      if (file) files.push(file);
    }
    cursor = response.NextContinuationToken;
  } while (cursor);

  const folders = [...folderPaths]
    .sort()
    .map((path) => ({ path, name: lastPathSegment(path) }));

  return { files, folders };
}

export async function refreshFileIndex(): Promise<void> {
  if (isRefreshing) return;
  isRefreshing = true;
  try {
    indexed = await loadBucketContents();
    isReady = true;
    console.log(
      `File index ready: ${indexed.files.length} files, ${indexed.folders.length} folders`
    );
    await saveCachedIndex(indexed);
  } finally {
    isRefreshing = false;
  }
}

// Uses the last saved index right away, then updates it from S3 in the background.
export function startFileIndexRefresh(): void {
  const refresh = () => {
    refreshFileIndex().catch((error: unknown) => {
      console.error("File index refresh failed:", error);
    });
  };

  void loadCachedIndex()
    .then((cached) => {
      if (cached && !isReady) {
        indexed = cached;
        isReady = true;
        console.log(
          `File index loaded from disk: ${cached.files.length} files`
        );
      }
    })
    .finally(refresh);

  setInterval(refresh, storageConfig.fileIndexRefreshMinutes * 60_000);
}

export function getFileIndex(): BucketContents & { isReady: boolean } {
  return { ...indexed, isReady };
}
