import { useEffect, useState } from "react";

// Loads something once when the component appears, with loading and error states.
// To load something different, give the component a new `key` so it starts fresh.
export function useLoadedData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    load()
      .then((loaded) => {
        if (isCurrent) setData(loaded);
      })
      .catch((cause: unknown) => {
        if (isCurrent)
          setError(cause instanceof Error ? cause.message : "Could not load.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
    // `load` is fixed for the component's life, so only reloads re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadCount]);

  return {
    data,
    isLoading,
    error,
    reload: () => setReloadCount((count) => count + 1),
  };
}
