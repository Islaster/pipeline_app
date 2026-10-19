import type { StoredFile } from "./storedFile";

// Who ShotGrid says worked on a version. Every field is "what we could find".
export interface LineageCredit {
  assignees: string[]; // people assigned to the version's task
  task: string | null;
  artist: string | null; // the version's Artist field
  publishedBy: string | null; // the account that created the version
  status: string | null;
  createdAt: string | null;
  description: string | null;
}

export interface LineageVersion {
  version: number;
  label: string; // "v0006"
  files: StoredFile[];
  isApproved: boolean; // a copy sits in an "_approved" folder
  firstSeen: string | null; // earliest date among its files
  credit: LineageCredit | null; // null when no ShotGrid version matches
}

export interface LineageBranch {
  step: string; // "lay", "sfa", ...
  vendor: string | null; // "30N"
  versions: LineageVersion[]; // oldest first
}

export interface ShotLineage {
  shotCode: string; // "006_HKA_0820"
  branches: LineageBranch[];
  isIndexReady: boolean; // false while the server is still reading storage
  shotgridNote: string | null; // set when credits couldn't be loaded
  tasks: LineageTask[]; // the task trail, in step order
  isInTrackedProject: boolean; // false: the shot isn't in the provenance project
  status: string | null; // the shot's ShotGrid status
  latestMedia: ShotLatestMedia | null;
  notes: {
    taskId: number | null;
    subject: string | null;
    content: string | null;
    author: string | null;
    createdAt: string | null;
  }[];
}

// One task on the shot, as ShotGrid recorded it.
export interface LineageTask {
  taskId: number;
  name: string; // "Layout"
  step: string | null;
  status: string | null;
  assignees: string[];
  startDate: string | null;
  dueDate: string | null;
  updatedAt: string | null;
  isReview: boolean;
}

// What's shown at the top of the tree.
export interface ShotLatestMedia {
  name: string;
  thumbnailUrl: string | null;
  movieUrl: string | null;
  createdAt: string | null;
  createdBy: string | null;
}

export interface LineageReview {
  taskId: number;
  taskName: string;
  reviewers: string[]; // who was assigned the review task
  status: string | null;
  startDate: string | null;
  notes: {
    subject: string | null;
    content: string | null;
    author: string | null;
    createdAt: string | null;
  }[];
}
