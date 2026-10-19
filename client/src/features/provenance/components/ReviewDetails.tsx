import type { LineageReview } from "../../../../../shared/types/provenance";

interface ReviewDetailsProps {
  shotCode: string;
  versionLabel: string;
  review: LineageReview;
  onClose: () => void;
}

export function ReviewDetails({
  shotCode,
  versionLabel,
  review,
  onClose,
}: ReviewDetailsProps) {
  return (
    <aside className="version-details">
      <header className="version-details__header">
        <h2>
          {shotCode} · {versionLabel} · {review.taskName}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <h3>Reviewed by</h3>
      <p>{review.reviewers.join(", ") || "Nobody was assigned."}</p>

      <h3>Review</h3>
      <dl className="version-details__facts">
        <dt>Status</dt>
        <dd>{review.status ?? "—"}</dd>
        <dt>Started</dt>
        <dd>
          {review.startDate
            ? new Date(review.startDate).toLocaleDateString()
            : "—"}
        </dd>
      </dl>

      <h3>Notes</h3>
      {review.notes.length === 0 && (
        <p className="provenance-page__note">
          No notes were linked to this review.
        </p>
      )}
      {review.notes.map((note, index) => (
        <article key={index} className="review-note">
          <p className="provenance-page__note">
            {[
              note.author,
              note.createdAt && new Date(note.createdAt).toLocaleDateString(),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {note.subject && <strong>{note.subject}</strong>}
          {note.content && (
            <p className="review-note__content">{note.content}</p>
          )}
        </article>
      ))}
    </aside>
  );
}
