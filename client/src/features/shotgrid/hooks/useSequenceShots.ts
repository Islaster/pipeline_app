import { useEffect, useRef, useState } from "react";
import type { ShotgridAssignedShot } from "../../../../../shared/types/shotgrid";
import { fetchSequenceShots } from "../api/shotgridApi";

const loadsAtOnce = 3; // sequences fetched at the same time when loading several

// Loads the shots for the wanted sequences, only fetching ones not loaded yet.
// Each sequence shows up as soon as it arrives, and stays loaded for the visit.
export function useSequenceShots(wantedSequenceIds: number[]) {
  const [shotsBySequenceId, setShotsBySequenceId] = useState<
    Record<number, ShotgridAssignedShot[]>
  >({});
  const [error, setError] = useState<string | null>(null);
  const loadedIds = useRef(new Set<number>());
  const wantedKey = wantedSequenceIds.join(",");

  useEffect(() => {
    let isCurrent = true;
    setError(null);
    const waiting = wantedSequenceIds.filter(
      (id) => !loadedIds.current.has(id)
    );

    // Takes sequences off the waiting list one by one until it's empty.
    async function loadFromWaitingList(): Promise<void> {
      for (
        let id = waiting.shift();
        id !== undefined && isCurrent;
        id = waiting.shift()
      ) {
        const sequenceId = id;
        const shots = await fetchSequenceShots(sequenceId);
        if (!isCurrent) return;
        loadedIds.current.add(sequenceId);
        setShotsBySequenceId((current) => ({
          ...current,
          [sequenceId]: shots,
        }));
      }
    }

    Promise.all(Array.from({ length: loadsAtOnce }, loadFromWaitingList)).catch(
      (cause: unknown) => {
        if (isCurrent)
          setError(
            cause instanceof Error ? cause.message : "Could not load shots."
          );
      }
    );

    return () => {
      isCurrent = false;
    };
    // The key stands in for the list of ids, which is rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantedKey]);

  const loaded = wantedSequenceIds.filter(
    (id) => shotsBySequenceId[id] !== undefined
  );
  return {
    shots: loaded.flatMap((id) => shotsBySequenceId[id] ?? []),
    loadedCount: loaded.length,
    error,
  };
}
