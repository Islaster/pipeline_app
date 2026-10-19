export interface TaskCard {
  id: number;
  name: string; // e.g. "Layout"
  step: string | null; // pipeline step the task belongs to
  status: string | null; // ShotGrid's short code, e.g. "ip"
  entityName: string | null; // the shot or asset, e.g. "006_HKA_0820"
  entityType: string | null; // "Shot", "Asset", ...
  sequence: string | null;
  project: { id: number; name: string } | null;
  assignees: string[];
  startDate: string | null; // "2026-10-15" or null
  dueDate: string | null;
  updatedAt: string | null;
}

export interface MyTasks {
  // How many ShotGrid people have this account's full name. Exactly 1 is the good case.
  matchingShotgridUsers: number;
  tasks: TaskCard[];
}

// One column of the board. Statuses not listed in the config fall into "other".
export interface TaskStatusColumn {
  code: string; // "ip"
  label: string; // "In Progress"
}

export interface TaskStatusChange {
  task: TaskCard; // the task as it is after the change
}
