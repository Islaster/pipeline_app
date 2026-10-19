import type { Response } from "express";
import type { StorageChange } from "../../../../../shared/types/storageEvents";
import { storageConfig } from "../config/storageConfig";

const listeners = new Set<Response>();
let pendingFolders = new Set<string>();
let sendTimer: ReturnType<typeof setTimeout> | null = null;

// Keeps a browser's connection open and sends it each change as it happens.
export function addChangeListener(res: Response): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");
  listeners.add(res);
  res.on("close", () => listeners.delete(res));
}

function sendPendingChanges(): void {
  sendTimer = null;
  const change: StorageChange = { folders: [...pendingFolders] };
  pendingFolders = new Set();

  const message = `event: storage-change\ndata: ${JSON.stringify(change)}\n\n`;
  for (const listener of listeners) listener.write(message);
}

// "Assets/Characters/" and every folder above it, since a new file can also mean a new folder.
function folderAndParents(folder: string): string[] {
  const folders = [""]; // the top level is always included
  let slashIndex = folder.indexOf("/");
  while (slashIndex !== -1) {
    folders.push(folder.slice(0, slashIndex + 1));
    slashIndex = folder.indexOf("/", slashIndex + 1);
  }
  return folders;
}

// Call this whenever a file appears in the bucket. Nearby changes are batched into one message.
export function announceStorageChange(fileKey: string): void {
  const folder = fileKey.slice(0, fileKey.lastIndexOf("/") + 1);
  for (const affected of folderAndParents(folder)) pendingFolders.add(affected);

  if (!sendTimer)
    sendTimer = setTimeout(
      sendPendingChanges,
      storageConfig.changeBatchDelayMs
    );
}

// Keeps connections alive through proxies that close idle ones.
setInterval(() => {
  for (const listener of listeners) listener.write(": ping\n\n");
}, 25_000).unref();
