// ---- Connection ----

export interface ShotgridConnectionStatus {
  isConfigured: boolean; // the credentials are set on the server
  isConnected: boolean; // ShotGrid accepted them
  message: string;
}

// ---- Browsing projects and shots ----

export interface ShotgridProject {
  id: number;
  name: string;
  status: string | null;
}

export interface ShotgridShot {
  id: number;
  code: string; // e.g. "006_HKA_0820"
  sequence: string | null;
  status: string | null; // ShotGrid's short status code, e.g. "ip"
}

export interface ShotgridShotArtists {
  shotId: number;
  artists: string[]; // names of everyone assigned to a task on this shot
}

export interface ShotgridSequence {
  id: number;
  name: string; // e.g. "006_HKA"
}

// A shot together with the artists assigned to its tasks.
export interface ShotgridAssignedShot extends ShotgridShot {
  artists: string[];
}

// ---- An artist's own assignments ----

export interface ShotgridAssignment {
  taskId: number;
  taskName: string; // e.g. "Layout"
  status: string | null;
  project: { id: number; name: string } | null;
  entityName: string | null; // the shot (or asset) the task is on, e.g. "006_HKA_0820"
  entityType: string | null; // "Shot", "Asset", ...
  sequence: string | null;
}

export interface MyShotgridAssignments {
  // How many ShotGrid people have this account's full name. Exactly 1 is the good case.
  matchingShotgridUsers: number;
  assignments: ShotgridAssignment[];
}

// ---- The shot side panel ----

export interface ShotgridMedia {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  movieUrl: string | null; // a temporary link to a playable movie, when ShotGrid has one
  status: string | null;
  createdBy: string | null;
  createdAt: string | null;
}

export interface ShotgridNote {
  id: number;
  subject: string | null;
  content: string | null;
  author: string | null;
  createdAt: string | null;
}

export interface ShotgridTask {
  id: number;
  name: string;
  step: string | null; // pipeline step, e.g. "Layout"
  status: string | null;
  assignees: string[];
  startDate: string | null; // e.g. "2026-10-15", or null when no date is set
  dueDate: string | null;
}

export interface ShotgridShotDetails {
  id: number;
  code: string;
  sequence: string | null;
  status: string | null;
  description: string | null;
  cutIn: number | null;
  cutOut: number | null;
  media: ShotgridMedia[]; // newest first
  notes: ShotgridNote[]; // newest first
  tasks: ShotgridTask[];
}
