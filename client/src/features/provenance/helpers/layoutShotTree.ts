import type {
  LineageReview,
  LineageTask,
  LineageVersion,
  ShotLineage,
} from "../../../../../shared/types/provenance";
import { buildShotTree, type TreeStage } from "./buildShotTree";
import type { TreeOptions } from "./treeOptions";

export const treeMetrics = {
  nodeWidth: 150,
  nodeHeight: 72,
  reviewHeight: 60,
  columnGap: 24, // horizontal space between versions
  rowGap: 56, // vertical space between a row of versions and the next stage
  stemLength: 24, // the short vertical line from a bar down into a node
  rootWidth: 320,
  rootHeight: 236, // media 180 + text
  stageLabelHeight: 36,
};

export type TreeNode =
  | { kind: "root"; id: string; x: number; y: number }
  | {
      kind: "stage";
      id: string;
      x: number;
      y: number;
      stage: TreeStage;
      task: LineageTask | null;
    }
  | {
      kind: "version";
      id: string;
      x: number;
      y: number;
      version: LineageVersion;
      step: string;
      stageTitle: string;
    }
  | {
      kind: "review";
      id: string;
      x: number;
      y: number;
      review: LineageReview;
      version: LineageVersion;
    };

export interface TreeLine {
  id: string;
  points: string; // SVG polyline points
  isInferred?: boolean; // dashed: an assumed link, not a recorded one
}

export interface TreeLayout {
  width: number;
  height: number;
  nodes: TreeNode[];
  lines: TreeLine[];
}

const m = treeMetrics;

// Draws an elbow: down from (x1, y1) to a bar at barY, across to x2, down to y2.
function elbow(
  x1: number,
  y1: number,
  x2: number,
  barY: number,
  y2: number
): string {
  return `${x1},${y1} ${x1},${barY} ${x2},${barY} ${x2},${y2}`;
}

export function layoutShotTree(
  lineage: ShotLineage,
  options: TreeOptions
): TreeLayout {
  const stages = buildShotTree(lineage).filter(
    (stage) => options.showFilesOnlyStages || stage.task !== null
  );
  const nodes: TreeNode[] = [];
  const lines: TreeLine[] = [];

  // Width is set by the widest row of versions.
  const widestRow = Math.max(
    1,
    ...stages.map((stage) =>
      stage.branches.reduce(
        (count, branch) => count + branch.versions.length,
        0
      )
    )
  );
  const width = Math.max(
    m.rootWidth + 80,
    widestRow * (m.nodeWidth + m.columnGap) + 80
  );
  const centerX = width / 2;

  // The shot at the top, centered.
  nodes.push({ kind: "root", id: "root", x: centerX - m.rootWidth / 2, y: 0 });
  let y = m.rootHeight;
  let previousBottomX = centerX; // where the line into the next stage starts
  let previousBottomY = y;

  for (const stage of stages) {
    const versions = stage.branches.flatMap((branch) =>
      branch.versions.map((version) => ({ version, step: branch.step }))
    );

    // The stage label sits on the line between rows.
    y += m.rowGap;
    const stageX = centerX - m.nodeWidth / 2;
    nodes.push({
      kind: "stage",
      id: `stage-${stage.key}`,
      x: stageX,
      y,
      stage,
      task: stage.task,
    });
    lines.push({
      id: `into-${stage.key}`,
      points: `${previousBottomX},${previousBottomY} ${centerX},${y}`,
      isInferred: stage.continuesFrom !== null,
    });
    y += m.stageLabelHeight;

    if (versions.length === 0) {
      previousBottomX = centerX;
      previousBottomY = y;
      continue;
    }

    // Versions centered under the stage label, joined by a bar.
    const rowWidth =
      versions.length * m.nodeWidth + (versions.length - 1) * m.columnGap;
    const rowStartX = centerX - rowWidth / 2;
    const barY = y + m.stemLength / 2;
    const versionY = y + m.stemLength;
    let rowBottom = versionY + m.nodeHeight;

    versions.forEach(({ version, step }, index) => {
      const x = rowStartX + index * (m.nodeWidth + m.columnGap);
      const nodeCenterX = x + m.nodeWidth / 2;
      const id = `version-${stage.key}-${step}-${version.version}`;
      nodes.push({
        kind: "version",
        id,
        x,
        y: versionY,
        version,
        step,
        stageTitle: stage.title,
      });
      lines.push({
        id: `line-${id}`,
        points: elbow(centerX, y, nodeCenterX, barY, versionY),
      });

      // Reviews hang below the version they're about.
      const reviews = stage.reviewsByVersion.get(version.version) ?? [];
      reviews.forEach((review, reviewIndex) => {
        const reviewY =
          versionY +
          m.nodeHeight +
          m.stemLength +
          reviewIndex * (m.reviewHeight + m.stemLength);
        const reviewId = `review-${review.taskId}`;
        nodes.push({
          kind: "review",
          id: reviewId,
          x,
          y: reviewY,
          review,
          version,
        });
        lines.push({
          id: `line-${reviewId}`,
          points: `${nodeCenterX},${
            reviewY - m.stemLength
          } ${nodeCenterX},${reviewY}`,
        });
        rowBottom = Math.max(rowBottom, reviewY + m.reviewHeight);
      });
    });

    // The next stage continues from this stage's last version.
    const last = versions.at(-1);
    const lastIndex = versions.length - 1;
    previousBottomX = last
      ? rowStartX + lastIndex * (m.nodeWidth + m.columnGap) + m.nodeWidth / 2
      : centerX;
    previousBottomY = last ? versionY + m.nodeHeight : y;
    y = rowBottom;
  }

  return { width, height: y + 24, nodes, lines };
}
