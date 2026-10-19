import { Router } from "express";
import { getFileDownloadUrl } from "./services/getFileDownloadUrl";
import { listFileVersions } from "./services/listFileVersions";
import { listStoredFiles } from "./services/listStoredFiles";
import { searchFiles } from "./services/searchFiles";
import { searchFolders } from "./services/searchFolders";
import { getFileThumbnail } from "./services/getFileThumbnail";
import type { AssetType } from "../../../../shared/types/storedFile";
import { UploadError } from "./helpers/UploadError";
import { createUploadUrl } from "./services/createUploadUrl";
import { addChangeListener } from "./services/storageChangeFeed";
import { announceStorageChange } from "./services/storageChangeFeed";

function readQueryString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export const storageRoutes = Router();

// GET /api/storage/files?folder=scenes/&cursor=...
storageRoutes.get("/files", async (req, res) => {
  const page = await listStoredFiles({
    folder: readQueryString(req.query.folder),
    cursor: readQueryString(req.query.cursor),
  });
  res.json(page);
});

// GET /api/storage/versions?key=scenes/intro/cut.mp4
storageRoutes.get("/versions", async (req, res) => {
  const key = readQueryString(req.query.key);
  if (!key) return res.status(400).json({ error: "key is required" });
  res.json(await listFileVersions(key));
});

// GET /api/storage/download-url?key=...&versionId=...
storageRoutes.get("/download-url", async (req, res) => {
  const key = readQueryString(req.query.key);
  if (!key) return res.status(400).json({ error: "key is required" });
  const url = await getFileDownloadUrl(key, {
    versionId: readQueryString(req.query.versionId),
    asAttachment: readQueryString(req.query.attachment) === "1",
  });
  res.json({ url });
});

// GET /api/storage/search?q=lay&target=files&within=Scene_Bin/006_(HKA)_HONG_KONG_ATTACK/
storageRoutes.get("/search", (req, res) => {
  const query = readQueryString(req.query.q) ?? "";
  const withinFolder = readQueryString(req.query.within);

  if (readQueryString(req.query.target) === "folders") {
    res.json(searchFolders(query, withinFolder));
    return;
  }

  res.json(
    searchFiles(query, {
      withinFolder,
      assetType: readAssetType(req.query.assetType),
    })
  );
});

storageRoutes.get("/thumbnail", async (req, res) => {
  const key = readQueryString(req.query.key);
  if (!key) {
    res.status(400).json({ error: "key is required" });
    return;
  }

  const version = readQueryString(req.query.v) ?? "";
  const thumbnail = await getFileThumbnail(key, version).catch(() => null);
  if (!thumbnail) {
    res.status(404).end();
    return;
  }

  res.set("Content-Type", "image/webp");
  // The address changes whenever the file does, so browsers can keep this for good.
  res.set("Cache-Control", "private, max-age=31536000, immutable");
  res.send(thumbnail);
});
storageRoutes.post("/upload-url", async (req, res) => {
  try {
    res.json(
      await createUploadUrl({
        folder: readQueryString(req.body?.folder) ?? "",
        fileName: readQueryString(req.body?.fileName) ?? "",
        sizeBytes: Number(req.body?.sizeBytes) || 0,
      })
    );
  } catch (error) {
    if (!(error instanceof UploadError)) throw error;
    res.status(error.status).json({ error: error.message });
  }
});
//HELPER FUNCTIONS
function readAssetType(value: unknown): AssetType | undefined {
  return value === "characterSheets" || value === "props" ? value : undefined;
}

// GET /api/storage/changes  -> a live stream of folder changes
storageRoutes.get("/changes", (_req, res) => {
  addChangeListener(res);
});

// POST /api/storage/upload-complete  { key }  -> the browser finished an upload
storageRoutes.post("/upload-complete", (req, res) => {
  const key = readQueryString(req.body?.key);
  if (key) announceStorageChange(key);
  res.status(204).end();
});
