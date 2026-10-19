import { useEffect, useRef, useState } from "react";
import type { TaskCard } from "../../../../../shared/types/tasks";
import { fetchSequenceTasks } from "../api/tasksApi";

const loadsAtOnce = 3;

// Loads tasks for the wanted sequences, a few at a time, showing each as it arrives.
// Works the same way as the shot board's useSequenceShots.
export function useSequenceTasks(wantedSequenceIds: number[]) {
  const [tasksBySequenceId, setTasksBySequenceId] = useState<
    Record<number, TaskCard[]>
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

    async function loadFromWaitingList(): Promise<void> {
      for (
        let id = waiting.shift();
        id !== undefined && isCurrent;
        id = waiting.shift()
      ) {
        const sequenceId = id;
        const tasks = await fetchSequenceTasks(sequenceId);
        if (!isCurrent) return;
        loadedIds.current.add(sequenceId);
        setTasksBySequenceId((current) => ({
          ...current,
          [sequenceId]: tasks,
        }));
      }
    }

    Promise.all(Array.from({ length: loadsAtOnce }, loadFromWaitingList)).catch(
      (cause: unknown) => {
        if (isCurrent)
          setError(
            cause instanceof Error ? cause.message : "Could not load tasks."
          );
      }
    );

    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantedKey]);

  const loaded = wantedSequenceIds.filter(
    (id) => tasksBySequenceId[id] !== undefined
  );

  function replaceTask(updated: TaskCard) {
    setTasksBySequenceId((current) => {
      const next = { ...current };
      for (const [sequenceId, tasks] of Object.entries(next)) {
        next[Number(sequenceId)] = tasks.map((task) =>
          task.id === updated.id ? updated : task
        );
      }
      return next;
    });
  }
  return {
    tasks: loaded.flatMap((id) => tasksBySequenceId[id] ?? []),
    loadedCount: loaded.length,
    error,
    replaceTask,
  };
}
