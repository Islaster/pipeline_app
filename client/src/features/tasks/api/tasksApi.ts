import type {
  MyTasks,
  TaskCard,
  TaskStatusColumn,
  TaskStatusChange,
} from "../../../../../shared/types/tasks";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/tasks${path}`);
  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(details?.error ?? `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export interface BoardColumns {
  columns: TaskStatusColumn[];
  otherLabel: string;
}

export function fetchBoardColumns(): Promise<BoardColumns> {
  return getJson<BoardColumns>("/columns");
}

export function fetchMyTasks(): Promise<MyTasks> {
  return getJson<MyTasks>("/mine");
}

export function fetchSequenceTasks(sequenceId: number): Promise<TaskCard[]> {
  return getJson<TaskCard[]>(`/sequences/${sequenceId}`);
}

export async function setTaskStatus(
  taskId: number,
  status: string
): Promise<TaskStatusChange> {
  const response = await fetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(details?.error ?? `Request failed (${response.status})`);
  }
  return (await response.json()) as TaskStatusChange;
}
