import type { ShotgridMedia } from "../../../../../shared/types/shotgrid";

export function ShotMediaViewer({ media }: { media: ShotgridMedia | null }) {
  if (!media)
    return (
      <div className="shot-media-viewer shot-media-viewer--empty">
        No media yet
      </div>
    );

  return (
    <figure className="shot-media-viewer">
      {media.movieUrl ? (
        <video
          key={media.id}
          src={media.movieUrl}
          poster={media.thumbnailUrl ?? undefined}
          controls
        />
      ) : media.thumbnailUrl ? (
        <img src={media.thumbnailUrl} alt={media.name} />
      ) : (
        <div className="shot-media-viewer--empty">
          No preview for this media
        </div>
      )}
      <figcaption>{media.name}</figcaption>
    </figure>
  );
}
