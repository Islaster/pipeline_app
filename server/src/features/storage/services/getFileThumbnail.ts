import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { s3Client } from "../config/s3Client";
import { storageConfig } from "../config/storageConfig";
import { createThumbnailInAws } from "./createThumbnailInAws";

const cacheFolder = path.resolve(storageConfig.thumbnailCacheFolder);

function canMakeThumbnail(key: string): boolean {
  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  return storageConfig.thumbnailExtensions.includes(extension);
}

// One saved thumbnail per file version, so an updated file gets a fresh one.
function cachePathFor(key: string, version: string): string {
  const name = createHash("sha256").update(`${key}\n${version}`).digest("hex");
  return path.join(cacheFolder, `${name}.webp`);
}

async function readSavedThumbnail(cachePath: string): Promise<Buffer | null> {
  try {
    return await readFile(cachePath);
  } catch {
    return null; // not made yet
  }
}

async function createThumbnail(key: string): Promise<Buffer | null> {
  const details = await s3Client.send(
    new HeadObjectCommand({ Bucket: storageConfig.bucket, Key: key })
  );
  if ((details.ContentLength ?? 0) > storageConfig.thumbnailMaxSourceBytes)
    return null;

  const original = await s3Client.send(
    new GetObjectCommand({ Bucket: storageConfig.bucket, Key: key })
  );
  if (!original.Body) return null;

  return sharp(await original.Body.transformToByteArray())
    .resize({
      width: storageConfig.thumbnailSizePx,
      height: storageConfig.thumbnailSizePx,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 75 })
    .toBuffer();
}

// Returns a small preview of an image file, or null when one can't be made.
// The first request downloads and shrinks the original; later ones read the saved copy.
export async function getFileThumbnail(
  key: string,
  version: string
): Promise<Buffer | null> {
  if (!canMakeThumbnail(key)) return null;

  const cachePath = cachePathFor(key, version);
  const saved = await readSavedThumbnail(cachePath);
  if (saved) return saved;

  const thumbnail = storageConfig.thumbnailFunctionName
    ? await createThumbnailInAws(key)
    : await createThumbnail(key); // fallback: download and shrink on this machine
  if (thumbnail) {
    await mkdir(cacheFolder, { recursive: true });
    await writeFile(cachePath, thumbnail);
  }
  return thumbnail;
}
