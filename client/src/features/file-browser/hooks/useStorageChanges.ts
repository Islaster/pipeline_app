import { useEffect, useRef } from "react";
import type { StorageChange } from "../../../../../shared/types/storageEvents";

type ChangeHandler = (change: StorageChange) => void;

const handlers = new Set<ChangeHandler>();
let stream: EventSource | null = null;

// One connection for the whole app, opened when the first folder listens and
// closed when the last one stops. The browser reconnects on its own if it drops.
function ensureStream(): void {
  if (stream) return;
  stream = new EventSource("/api/storage/changes");
  stream.addEventListener("storage-change", (event) => {
    const change = JSON.parse(
      (event as MessageEvent<string>).data
    ) as StorageChange;
    for (const handler of handlers) handler(change);
  });
}

function closeStreamIfUnused(): void {
  if (handlers.size === 0 && stream) {
    stream.close();
    stream = null;
  }
}

// Runs `onChange` whenever the given folder's contents change in storage.
export function useStorageChanges(folder: string, onChange: () => void): void {
  const latestOnChange = useRef(onChange);
  latestOnChange.current = onChange;

  useEffect(() => {
    const handler: ChangeHandler = (change) => {
      if (change.folders.includes(folder)) latestOnChange.current();
    };
    handlers.add(handler);
    ensureStream();

    return () => {
      handlers.delete(handler);
      closeStreamIfUnused();
    };
  }, [folder]);
}
