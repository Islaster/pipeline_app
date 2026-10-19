import { useCallback, useEffect, useState } from "react";
import type {
  StoredFile,
  StoredFolder,
} from "../../../../../shared/types/storedFile";
import { fetchFolderContents } from "../api/storageApi";
import { useStorageChanges } from "./useStorageChanges";

export function useFolderContents(folder: string) {
  const [folders, setFolders] = useState<StoredFolder[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true; // ignore results from a folder we've already left
    const isFirstLoad = reloadCount === 0;
    if (isFirstLoad) setIsLoading(true); // later reloads keep the current list on screen
    setError(null);

    fetchFolderContents(folder)
      .then((page) => {
        if (!isCurrent) return;
        setFolders(page.folders);
        setFiles(page.files);
        setNextCursor(page.nextCursor);
      })
      .catch((cause: unknown) => {
        if (isCurrent)
          setError(
            cause instanceof Error ? cause.message : "Could not load files"
          );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [folder, reloadCount]);

  // When storage changes under this folder, fetch it again without a loading flash.
  useStorageChanges(
    folder,
    useCallback(() => setReloadCount((count) => count + 1), [])
  );

  async function loadMore() {
    if (!nextCursor) return;
    try {
      const page = await fetchFolderContents(folder, nextCursor);
      setFolders((current) => [...current, ...page.folders]);
      setFiles((current) => [...current, ...page.files]);
      setNextCursor(page.nextCursor);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load more files"
      );
    }
  }

  return { folders, files, nextCursor, isLoading, error, loadMore };
}
