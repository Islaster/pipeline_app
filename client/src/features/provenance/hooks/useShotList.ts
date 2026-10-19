import { useEffect, useState } from "react";
import { fetchLineageShots, type LineageShotList } from "../api/provenanceApi";

const searchDelayMs = 250; // wait for a pause in typing
const empty: LineageShotList = { sequences: [], shots: [], totalMatches: 0 };

// The sidebar's sequences and shots, refreshed when the project, sequence, or search text changes.
export function useShotList(
  searchText: string,
  sequence: string | null,
  projectId: number | null
) {
  const [list, setList] = useState<LineageShotList>(empty);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const timer = setTimeout(() => {
      fetchLineageShots(searchText, sequence, projectId)
        .then((found) => {
          if (!isCurrent) return;
          setList(found);
          setError(null);
        })
        .catch((cause: unknown) => {
          if (isCurrent)
            setError(
              cause instanceof Error ? cause.message : "Could not load shots."
            );
        });
    }, searchDelayMs);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchText, sequence, projectId]);

  return { ...list, error };
}
