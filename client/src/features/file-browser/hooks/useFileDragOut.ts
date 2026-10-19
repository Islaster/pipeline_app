import { useEffect, useRef, type DragEvent } from "react";
import type { StoredFile } from "../../../../../shared/types/storedFile";
import { fetchDownloadUrl } from "../api/storageApi";

// Lets a file be dragged out of the browser onto the desktop or a folder.
// Only Chrome and Edge support this (it's the "DownloadURL" drag format), and the browser
// reads the link at the instant the drag starts, so a fresh one is fetched in advance.
export function useFileDragOut(file: StoredFile) {
  const downloadUrl = useRef<string | null>(null);

  useEffect(() => {
    downloadUrl.current = null; // a different file now
  }, [file.key]);

  // Fetched on hover, so the link is ready by the time a drag begins.
  function prepare() {
    if (downloadUrl.current) return;
    fetchDownloadUrl(file.key)
      .then((url) => {
        downloadUrl.current = url;
      })
      .catch(() => {
        // Dragging won't work for this file; the download button still does.
      });
  }

  function onDragStart(event: DragEvent) {
    const url = downloadUrl.current;
    if (!url) return;
    const type = "application/octet-stream";
    event.dataTransfer.setData("DownloadURL", `${type}:${file.name}:${url}`);
    event.dataTransfer.setData("text/uri-list", url); // other browsers get a link
    event.dataTransfer.effectAllowed = "copy";
  }

  return {
    draggable: true,
    onMouseEnter: prepare,
    onFocus: prepare,
    onDragStart,
  };
}
