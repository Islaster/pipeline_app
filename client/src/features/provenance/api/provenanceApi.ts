import type { ShotLineage } from "../../../../../shared/types/provenance";

export interface LineageShotList {
  sequences: string[];
  shots: string[];
  totalMatches: number;
}

export interface ProvenanceProject {
  id: number;
  name: string;
  isDefault: boolean;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/provenance${path}`);
  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(details?.error ?? `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export function fetchLineageShots(
  query: string,
  sequence: string | null,
  projectId: number | null
): Promise<LineageShotList> {
  const params = new URLSearchParams({ q: query });
  if (sequence) params.set("sequence", sequence);
  if (projectId !== null) params.set("project", String(projectId));
  return getJson<LineageShotList>(`/shots?${params}`);
}

export function fetchProvenanceProjects(): Promise<ProvenanceProject[]> {
  return getJson<ProvenanceProject[]>("/projects");
}

export function fetchShotLineage(
  shotCode: string,
  projectId: number | null
): Promise<ShotLineage> {
  const params = new URLSearchParams();
  if (projectId !== null) params.set("project", String(projectId));
  return getJson<ShotLineage>(
    `/shots/${encodeURIComponent(shotCode)}?${params}`
  );
}
