import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3Client";
import { storageConfig } from "../config/storageConfig";
import { UploadError } from "../helpers/UploadError";

interface UploadRequest {
  folder: string; // e.g. "Assets/Characters/"
  fileName: string;
  sizeBytes: number;
}

function isValidFolder(folder: string): boolean {
  return (
    folder.endsWith("/") &&
    !folder.startsWith("/") &&
    !folder.includes("//") &&
    !folder.split("/").includes("..")
  );
}

function isValidFileName(fileName: string): boolean {
  return (
    fileName.length > 0 && fileName.length <= 255 && !/[\\/]/.test(fileName)
  );
}

async function fileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({ Bucket: storageConfig.bucket, Key: key })
    );
    return true;
  } catch (error) {
    if (error instanceof NotFound) return false;
    throw error;
  }
}

// Returns a temporary link the browser can upload one file to.
export async function createUploadUrl(
  request: UploadRequest
): Promise<{ uploadUrl: string; key: string }> {
  const { folder, fileName, sizeBytes } = request;

  if (!isValidFolder(folder))
    throw new UploadError(400, "Choose a folder to upload into.");
  if (!isValidFileName(fileName))
    throw new UploadError(400, "That file name can't be used.");
  if (sizeBytes > storageConfig.maxUploadBytes) {
    throw new UploadError(400, "Files over 5 GB can't be uploaded here yet.");
  }

  const key = `${folder}${fileName}`;

  // Never replace a production file: a name that's already taken is refused.
  if (await fileExists(key)) {
    throw new UploadError(409, `"${fileName}" already exists in this folder.`);
  }

  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({ Bucket: storageConfig.bucket, Key: key }),
    { expiresIn: storageConfig.uploadUrlExpiresInSeconds }
  );
  return { uploadUrl, key };
}
