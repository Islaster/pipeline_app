import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import type {
  StoredFile,
  StoredFilePage,
  StoredFolder,
} from "../../../../../shared/types/storedFile";
import { s3Client } from "../config/s3Client";
import { storageConfig } from "../config/storageConfig";
import { lastPathSegment, toStoredFile } from "../helpers/toStoredFile";

interface ListStoredFilesOptions {
  folder?: string;
  cursor?: string;
  pageSize?: number;
}

function toFolderPrefix(folder?: string): string | undefined {
  if (!folder) return undefined;
  return folder.endsWith("/") ? folder : `${folder}/`;
}

// Lists one folder level: its subfolders and the files directly inside it.
export async function listStoredFiles(
  options: ListStoredFilesOptions = {}
): Promise<StoredFilePage> {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: storageConfig.bucket,
      Prefix: toFolderPrefix(options.folder),
      Delimiter: "/",
      ContinuationToken: options.cursor,
      MaxKeys: options.pageSize ?? 100,
    })
  );

  const folders: StoredFolder[] = [];
  for (const { Prefix } of response.CommonPrefixes ?? []) {
    if (Prefix) folders.push({ path: Prefix, name: lastPathSegment(Prefix) });
  }

  const files: StoredFile[] = [];
  for (const object of response.Contents ?? []) {
    const file = toStoredFile(object);
    if (file) files.push(file);
  }

  return { folders, files, nextCursor: response.NextContinuationToken ?? null };
}
