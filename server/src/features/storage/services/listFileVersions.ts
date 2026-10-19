import { ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import type { StoredFileVersion } from "../../../../../shared/types/storedFile";
import { s3Client } from "../config/s3Client";
import { storageConfig } from "../config/storageConfig";

export async function listFileVersions(
  key: string
): Promise<StoredFileVersion[]> {
  const response = await s3Client.send(
    new ListObjectVersionsCommand({
      Bucket: storageConfig.bucket,
      Prefix: key,
    })
  );

  return (response.Versions ?? [])
    .filter((version) => version.Key === key) // Prefix can match other keys too
    .map((version) => ({
      versionId: version.VersionId ?? "",
      sizeBytes: version.Size ?? 0,
      lastModified: version.LastModified?.toISOString() ?? "",
      isLatest: version.IsLatest ?? false,
    }));
}
