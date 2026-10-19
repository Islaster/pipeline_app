import type { TaskCard } from "../../../../../shared/types/tasks";

export const showAll = "";

export function artistsIn(tasks: TaskCard[]): string[] {
  return [...new Set(tasks.flatMap((task) => task.assignees))].sort();
}

export function stepsIn(tasks: TaskCard[]): string[] {
  return [...new Set(tasks.flatMap((task) => task.step ?? []))].sort();
}

export function filterTasks(
  tasks: TaskCard[],
  artist: string,
  step: string
): TaskCard[] {
  return tasks.filter(
    (task) =>
      (artist === showAll || task.assignees.includes(artist)) &&
      (step === showAll || task.step === step)
  );
}
