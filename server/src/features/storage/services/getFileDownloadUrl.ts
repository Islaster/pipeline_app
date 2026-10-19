import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3Client";
import { storageConfig } from "../config/storageConfig";

interface DownloadUrlOptions {
  versionId?: string;
  asAttachment?: boolean; // true: the browser saves the file instead of opening it
}

// Quotes and non-ASCII characters can't go in a plain header value, so the name is
// sent in RFC 5987 form, which every current browser understands.
function attachmentHeader(fileName: string): string {
  const safeName = fileName.replace(/["\\]/g, "_");
  return `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(
    fileName
  )}`;
}

// Returns a temporary link so the bucket can stay private.
export function getFileDownloadUrl(
  key: string,
  options: DownloadUrlOptions = {}
): Promise<string> {
  const fileName = key.split("/").pop() ?? key;
  const command = new GetObjectCommand({
    Bucket: storageConfig.bucket,
    Key: key,
    VersionId: options.versionId,
    ResponseContentDisposition: options.asAttachment
      ? attachmentHeader(fileName)
      : undefined,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: storageConfig.downloadUrlExpiresInSeconds,
  });
}
