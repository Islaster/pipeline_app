function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const storageConfig = {
  region: requireEnv("AWS_REGION"),
  bucket: requireEnv("S3_BUCKET_NAME"),
  hiddenFileNames: [".bzEmpty", ".DS_Store"],
  hiddenFilePrefixes: ["._"], // macOS metadata copies of real files
  fileIndexCachePath: ".cache/file-index.json", // relative to server/
  downloadUrlExpiresInSeconds: 300,
  fileIndexRefreshMinutes: 10,
  searchResultLimit: 200,
  thumbnailCacheFolder: ".cache/thumbnails", // relative to server/
  thumbnailSizePx: 320,
  thumbnailMaxSourceBytes: 150 * 1024 * 1024, // skip originals bigger than 150 MB
  thumbnailExtensions: ["png", "jpg", "jpeg", "webp", "gif"],
  thumbnailFunctionName: process.env.THUMBNAIL_FUNCTION_NAME ?? "", // empty: shrink images locally
  maxUploadBytes: 5 * 1024 ** 3, // 5 GB, the most S3 accepts in a single upload
  uploadUrlExpiresInSeconds: 900,
  eventsQueueUrl: process.env.STORAGE_EVENTS_QUEUE_URL ?? "", // empty: no S3 notifications
  changeBatchDelayMs: 500, // changes within this window are sent as one update
};
