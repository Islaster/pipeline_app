import type { ShotgridMedia } from "../../../../../shared/types/shotgrid";

interface ShotMediaTabProps {
  media: ShotgridMedia[];
  shownId: number | null;
  onShow: (mediaId: number) => void;
}

export function ShotMediaTab({ media, shownId, onShow }: ShotMediaTabProps) {
  if (media.length === 0)
    return <p className="shotgrid-page__note">No media on this shot.</p>;

  return (
    <div className="shot-panel__list">
      {media.map((item) => (
        <button
          type="button"
          key={item.id}
          className={`shot-media-item${
            item.id === shownId ? " shot-media-item--shown" : ""
          }`}
          onClick={() => onShow(item.id)}
        >
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" loading="lazy" />
          ) : (
            <span className="shot-media-item__no-thumbnail" />
          )}
          <span className="shot-media-item__text">
            <span className="shot-media-item__name">{item.name}</span>
            <span className="shot-panel__meta">
              {[
                item.status,
                item.createdBy,
                item.createdAt && new Date(item.createdAt).toLocaleDateString(),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
