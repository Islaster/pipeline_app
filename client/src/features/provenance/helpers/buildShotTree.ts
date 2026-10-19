import type {
  LineageBranch,
  LineageReview,
  LineageTask,
  LineageVersion,
  ShotLineage,
} from "../../../../../shared/types/provenance";

// One row of the tree: a work stage, its versions, and the reviews hung off them.
export interface TreeStage {
  key: string;
  title: string;
  task: LineageTask | null; // null when files exist with no ShotGrid task
  branches: LineageBranch[];
  reviewsByVersion: Map<number, LineageReview[]>; // version number -> reviews of it
  continuesFrom: { stageTitle: string; versionLabel: string } | null; // inferred link to the stage before
}

const stepAliases: Record<string, string> = {
  lay: "layout",
  anim: "animation",
  sfa: "animation",
  ffs: "fx",
  comp: "comp",
  lgt: "lighting",
  vzo: "layout",
};

function stepName(step: string): string {
  const lower = step.toLowerCase();
  return stepAliases[lower] ?? lower;
}

function allVersions(stage: TreeStage): LineageVersion[] {
  return stage.branches.flatMap((branch) => branch.versions);
}

// The version a review is about: the newest one that existed when the review started,
// or the stage's last version when dates can't tell us.
function versionUnderReview(
  stage: TreeStage,
  review: LineageTask
): LineageVersion | null {
  const versions = allVersions(stage);
  if (versions.length === 0) return null;
  const started = review.startDate;
  const existing = started
    ? versions.filter(
        (version) => (version.firstSeen ?? "") <= `${started}T23:59:59`
      )
    : [];
  return existing.at(-1) ?? versions.at(-1) ?? null;
}

// The version the next stage picks up from: the last approved one, else the last reviewed, else the last.
function handoffVersion(stage: TreeStage): LineageVersion | null {
  const versions = allVersions(stage);
  const approved = versions.filter((version) => version.isApproved).at(-1);
  if (approved) return approved;
  const reviewed = versions
    .filter((version) => stage.reviewsByVersion.has(version.version))
    .at(-1);
  return reviewed ?? versions.at(-1) ?? null;
}

export function buildShotTree(lineage: ShotLineage): TreeStage[] {
  const stages: TreeStage[] = [];
  const unplacedBranches = [...lineage.branches];

  // Work stages first, in task order, each claiming the file branches for its step.
  for (const task of lineage.tasks) {
    if (task.isReview) continue;
    const wanted = stepName(task.step ?? task.name);
    const branches = unplacedBranches.filter(
      (branch) => stepName(branch.step) === wanted
    );
    for (const branch of branches)
      unplacedBranches.splice(unplacedBranches.indexOf(branch), 1);

    stages.push({
      key: `task-${task.taskId}`,
      title: task.step ?? task.name,
      task,
      branches,
      reviewsByVersion: new Map(),
      continuesFrom: null,
    });
  }

  // Files with no matching task get their own stage, placed by their earliest version date.
  for (const branch of unplacedBranches) {
    stages.push({
      key: `branch-${branch.step}-${branch.vendor ?? ""}`,
      title: branch.step,
      task: null,
      branches: [branch],
      reviewsByVersion: new Map(),
      continuesFrom: null,
    });
  }

  // Review tasks hang off the stage that came before them in the task order.
  for (const [index, task] of lineage.tasks.entries()) {
    if (!task.isReview) continue;
    const previousWork = lineage.tasks
      .slice(0, index)
      .reverse()
      .find((candidate) => !candidate.isReview);
    const stage = previousWork
      ? stages.find(
          (candidate) => candidate.task?.taskId === previousWork.taskId
        )
      : stages[0];
    if (!stage) continue;

    const version = versionUnderReview(stage, task);
    if (!version) continue;

    const review: LineageReview = {
      taskId: task.taskId,
      taskName: task.name,
      reviewers: task.assignees,
      status: task.status,
      startDate: task.startDate,
      notes: lineage.notes.filter((note) => note.taskId === task.taskId),
    };
    const reviews = stage.reviewsByVersion.get(version.version) ?? [];
    stage.reviewsByVersion.set(version.version, [...reviews, review]);
  }

  // Each stage after the first continues from the handoff version of the one before it.
  for (let index = 1; index < stages.length; index += 1) {
    const previous = stages[index - 1];
    const current = stages[index];
    const handoff = previous && handoffVersion(previous);
    if (current && previous && handoff) {
      current.continuesFrom = {
        stageTitle: previous.title,
        versionLabel: handoff.label,
      };
    }
  }

  return stages;
}
