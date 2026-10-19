import { useEffect, useState } from "react";
import type {
  LineageTask,
  LineageVersion,
  ShotLineage,
  LineageReview,
} from "../../../../../shared/types/provenance";
import { fetchShotLineage } from "../api/provenanceApi";
import { ShotTree } from "./ShotTree";
import { TaskDetails } from "./TaskDetails";
import { VersionDetails } from "./VersionDetails";
import { ReviewDetails } from "./ReviewDetails";
import type { TreeOptions } from "../helpers/treeOptions";

// What's open in the side panel: a version node, a task node, or nothing.
type Selection =
  | { kind: "version"; version: LineageVersion; step: string }
  | { kind: "task"; task: LineageTask }
  | { kind: "review"; review: LineageReview; version: LineageVersion }
  | null;
// Loads and shows one shot's tree. Give it a `key` so it starts fresh for each shot.
export function ShotLineageView({
  shotCode,
  projectId,
  options,
}: {
  shotCode: string;
  projectId: number | null;
  options: TreeOptions;
}) {
  const [lineage, setLineage] = useState<ShotLineage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>(null);

  useEffect(() => {
    let isCurrent = true;
    fetchShotLineage(shotCode, projectId)
      .then((loaded) => {
        if (isCurrent) setLineage(loaded);
      })
      .catch((cause: unknown) => {
        if (isCurrent)
          setError(
            cause instanceof Error ? cause.message : "Could not load the tree."
          );
      });
    return () => {
      isCurrent = false;
    };
  }, [shotCode, projectId]);

  if (error) return <p className="form-error">{error}</p>;
  if (!lineage)
    return <p className="provenance-page__note">Loading the tree…</p>;

  const hasNothing =
    lineage.branches.length === 0 && lineage.tasks.length === 0;

  return (
    <>
      {!lineage.isIndexReady && (
        <p className="provenance-page__note">
          The server is still reading storage, so this tree may be incomplete.
          Try again in a moment.
        </p>
      )}
      {lineage.shotgridNote && (
        <p className="provenance-page__note">{lineage.shotgridNote}</p>
      )}
      {!lineage.isInTrackedProject && (
        <p className="provenance-page__note">
          This shot isn't in the tracked project, so there's no task trail for
          it.
        </p>
      )}
      {hasNothing && (
        <p className="provenance-page__note">
          Nothing is recorded for this shot yet.
        </p>
      )}

      <ShotTree
        lineage={lineage}
        selectedTask={selection?.kind === "task" ? selection.task : null}
        selectedVersion={
          selection?.kind === "version" ? selection.version : null
        }
        selectedReview={selection?.kind === "review" ? selection.review : null}
        onSelectTask={(task) => setSelection({ kind: "task", task })}
        onSelectVersion={(version, step) =>
          setSelection({ kind: "version", version, step })
        }
        onSelectReview={(review, version) =>
          setSelection({ kind: "review", review, version })
        }
        options={options}
      />

      {selection?.kind === "version" && (
        <VersionDetails
          shotCode={lineage.shotCode}
          step={selection.step}
          version={selection.version}
          onClose={() => setSelection(null)}
        />
      )}
      {selection?.kind === "task" && (
        <TaskDetails
          shotCode={lineage.shotCode}
          task={selection.task}
          onClose={() => setSelection(null)}
        />
      )}
      {selection?.kind === "review" && (
        <ReviewDetails
          shotCode={lineage.shotCode}
          versionLabel={selection.version.label}
          review={selection.review}
          onClose={() => setSelection(null)}
        />
      )}
    </>
  );
}
