import type {
  ShotgridConnectionStatus,
  ShotgridProject,
  ShotgridShot,
  MyShotgridAssignments,
  ShotgridShotArtists,
  ShotgridShotDetails,
  ShotgridSequence,
  ShotgridAssignedShot,
} from "../../../../../shared/types/shotgrid";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/shotgrid${path}`);
  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(details?.error ?? `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export function fetchConnectionStatus(): Promise<ShotgridConnectionStatus> {
  return getJson<ShotgridConnectionStatus>("/status");
}

export function fetchProjects(): Promise<ShotgridProject[]> {
  return getJson<ShotgridProject[]>("/projects");
}

export function fetchShots(projectId: number): Promise<ShotgridShot[]> {
  return getJson<ShotgridShot[]>(`/projects/${projectId}/shots`);
}

export function fetchMyAssignments(): Promise<MyShotgridAssignments> {
  return getJson<MyShotgridAssignments>("/my-assignments");
}

export function fetchShotArtists(
  projectId: number
): Promise<ShotgridShotArtists[]> {
  return getJson<ShotgridShotArtists[]>(`/projects/${projectId}/shot-artists`);
}

export function fetchShotDetails(shotId: number): Promise<ShotgridShotDetails> {
  return getJson<ShotgridShotDetails>(`/shots/${shotId}`);
}

export function fetchSequences(projectId: number): Promise<ShotgridSequence[]> {
  return getJson<ShotgridSequence[]>(`/projects/${projectId}/sequences`);
}

export function fetchSequenceShots(
  sequenceId: number
): Promise<ShotgridAssignedShot[]> {
  return getJson<ShotgridAssignedShot[]>(`/sequences/${sequenceId}/shots`);
}
