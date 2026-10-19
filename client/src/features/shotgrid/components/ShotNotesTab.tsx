import type { ShotgridNote } from "../../../../../shared/types/shotgrid";

export function ShotNotesTab({ notes }: { notes: ShotgridNote[] }) {
  if (notes.length === 0)
    return <p className="shotgrid-page__note">No notes on this shot.</p>;

  return (
    <div className="shot-panel__list">
      {notes.map((note) => (
        <article key={note.id} className="shot-note">
          <p className="shot-panel__meta">
            {[
              note.author,
              note.createdAt && new Date(note.createdAt).toLocaleDateString(),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {note.subject && <strong>{note.subject}</strong>}
          {note.content && <p className="shot-note__content">{note.content}</p>}
        </article>
      ))}
    </div>
  );
}
