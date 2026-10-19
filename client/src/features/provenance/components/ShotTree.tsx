import { useRef } from "react";
import type {
  LineageReview,
  LineageTask,
  LineageVersion,
  ShotLineage,
} from "../../../../../shared/types/provenance";
import { summarizeCredit } from "../helpers/creditSummary";
import { layoutShotTree, treeMetrics } from "../helpers/layoutShotTree";
import { ShotRootNode } from "./ShotRootNode";
import { TreeLegend } from "./TreeLegend";
import { useDragToPan } from "../hooks/useDragToPan";
import { useViewport } from "../hooks/useViewport";
import { TreeMinimap } from "./TreeMinimap";
import type { TreeOptions } from "../helpers/treeOptions";

interface ShotTreeProps {
  lineage: ShotLineage;
  selectedTask: LineageTask | null;
  selectedVersion: LineageVersion | null;
  selectedReview: LineageReview | null;
  onSelectTask: (task: LineageTask) => void;
  onSelectVersion: (version: LineageVersion, step: string) => void;
  onSelectReview: (review: LineageReview, version: LineageVersion) => void;
  options: TreeOptions;
}

function shortDate(value: string | null): string {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";
}

export function ShotTree({
  lineage,
  selectedTask,
  selectedVersion,
  selectedReview,
  onSelectTask,
  onSelectVersion,
  onSelectReview,
  options,
}: ShotTreeProps) {
  const layout = layoutShotTree(lineage, options);
  const m = treeMetrics;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pan = useDragToPan(scrollRef);
  const viewport = useViewport(scrollRef, `${layout.width}x${layout.height}`);

  function moveTo(left: number, top: number) {
    scrollRef.current?.scrollTo({ left, top });
  }

  return (
    <div className="shot-tree">
      <TreeLegend />
      <div
        ref={scrollRef}
        className="shot-tree__scroller"
        onMouseDown={pan.onMouseDown}
      >
        <div
          className="shot-tree__track"
          style={{ minWidth: layout.width, minHeight: layout.height }}
        >
          <div
            className="shot-tree__canvas"
            style={{ width: layout.width, height: layout.height }}
          >
            <svg
              className="shot-tree__lines"
              width={layout.width}
              height={layout.height}
              aria-hidden="true"
            >
              {layout.lines.map((line) => (
                <polyline
                  key={line.id}
                  points={line.points}
                  className={`shot-tree__line${
                    line.isInferred ? " shot-tree__line--inferred" : ""
                  }`}
                />
              ))}
            </svg>

            {layout.nodes.map((node) => {
              const place = { left: node.x, top: node.y };

              if (node.kind === "root") {
                return (
                  <div
                    key={node.id}
                    className="tree-place"
                    style={{ ...place, width: m.rootWidth }}
                  >
                    <ShotRootNode lineage={lineage} />
                  </div>
                );
              }

              if (node.kind === "stage") {
                const { task, stage } = node;
                return (
                  <div
                    key={node.id}
                    className="tree-place tree-place--stage"
                    style={{ ...place, width: m.nodeWidth }}
                  >
                    {task ? (
                      <button
                        type="button"
                        className={`stage-label${
                          task === selectedTask ? " stage-label--selected" : ""
                        }`}
                        onClick={() => onSelectTask(task)}
                      >
                        <strong>{stage.title}</strong>
                        <span>{task.assignees.join(", ") || "Unassigned"}</span>
                      </button>
                    ) : (
                      <div className="stage-label stage-label--no-task">
                        <strong>{stage.title}</strong>
                        <span>files only</span>
                      </div>
                    )}
                  </div>
                );
              }

              if (node.kind === "version") {
                const { version, step } = node;
                return (
                  <div
                    key={node.id}
                    className="tree-place"
                    style={{
                      ...place,
                      width: m.nodeWidth,
                      height: m.nodeHeight,
                    }}
                  >
                    <button
                      type="button"
                      className={[
                        "tree-card",
                        version === selectedVersion
                          ? "tree-card--selected"
                          : "",
                        version.isApproved ? "tree-card--approved" : "",
                      ].join(" ")}
                      onClick={() => onSelectVersion(version, step)}
                    >
                      <span className="tree-card__kind">{node.stageTitle}</span>
                      <strong>
                        {version.label}
                        {version.isApproved && " ★"}
                      </strong>
                      <span className="tree-card__meta">
                        {summarizeCredit(version.credit)}
                      </span>
                    </button>
                    <span className="tree-card__caption">
                      {shortDate(version.firstSeen)}
                    </span>
                  </div>
                );
              }

              const { review, version } = node;
              return (
                <div
                  key={node.id}
                  className="tree-place"
                  style={{
                    ...place,
                    width: m.nodeWidth,
                    height: m.reviewHeight,
                  }}
                >
                  <button
                    type="button"
                    className={`tree-card tree-card--review${
                      review === selectedReview ? " tree-card--selected" : ""
                    }`}
                    onClick={() => onSelectReview(review, version)}
                  >
                    <span className="tree-card__kind">review</span>
                    <strong>
                      {review.reviewers.join(", ") || review.taskName}
                    </strong>
                    <span className="tree-card__meta">
                      {review.status ?? "—"}
                      {review.notes.length > 0
                        ? ` · ${review.notes.length} notes`
                        : ""}
                    </span>
                  </button>
                  <span className="tree-card__caption">
                    {shortDate(review.startDate)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <TreeMinimap layout={layout} viewport={viewport} onMoveTo={moveTo} />
    </div>
  );
}
