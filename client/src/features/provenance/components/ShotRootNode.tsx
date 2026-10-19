import type { ShotLineage } from "../../../../../shared/types/provenance";

export function ShotRootNode({ lineage }: { lineage: ShotLineage }) {
  const media = lineage.latestMedia;
  const stepCount = lineage.tasks.filter((task) => !task.isReview).length;

  return (
    <div className="shot-root">
      <div className="shot-root__media">
        {media?.movieUrl ? (
          <video
            src={media.movieUrl}
            poster={media.thumbnailUrl ?? undefined}
            controls
            muted
          />
        ) : media?.thumbnailUrl ? (
          <img src={media.thumbnailUrl} alt={media.name} />
        ) : (
          <div className="shot-root__no-media">No media yet</div>
        )}
      </div>
      <div className="shot-root__title">
        <strong>{lineage.shotCode}</strong>
        {media?.createdAt && (
          <span className="shot-root__date">
            ·{" "}
            {new Date(media.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        {lineage.status && (
          <span className="shot-root__status">{lineage.status}</span>
        )}
      </div>
      <p className="shot-root__caption">
        {stepCount > 0
          ? `made through ${stepCount} ${stepCount === 1 ? "stage" : "stages"}`
          : media
          ? `Latest: ${media.name}`
          : "No versions in ShotGrid"}
      </p>
    </div>
  );
}
