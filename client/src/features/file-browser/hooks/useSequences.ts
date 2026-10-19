import { useEffect, useState } from "react";
import type { StoredFolder } from "../../../../../shared/types/storedFile";
import { fetchFolderContents } from "../api/storageApi";
import { useStorageChanges } from "./useStorageChanges";

// Each folder directly inside Scene_Bin/ is one sequence,
// e.g. "Scene_Bin/006_(HKA)_HONG_KONG_ATTACK/".
const sequencesFolder = "Scene_Bin/";

async function fetchAllSequences(): Promise<StoredFolder[]> {
  const sequences: StoredFolder[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchFolderContents(sequencesFolder, cursor);
    sequences.push(...page.folders);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return sequences;
}

export function useSequences(): StoredFolder[] {
  const [sequences, setSequences] = useState<StoredFolder[]>([]);
  const [reloadCount, setReloadCount] = useState(0);

  // Loads once at the start, and again each time reloadCount changes.
  useEffect(() => {
    let isCurrent = true;
    fetchAllSequences()
      .then((found) => {
        if (isCurrent) setSequences(found);
      })
      .catch(() => {
        // The sidebar shows "No sequences found" when the list stays empty.
      });
    return () => {
      isCurrent = false;
    };
  }, [reloadCount]);

  // A new sequence folder in storage bumps reloadCount, which re-runs the load above.
  useStorageChanges(sequencesFolder, () =>
    setReloadCount((count) => count + 1)
  );

  return sequences;
}
