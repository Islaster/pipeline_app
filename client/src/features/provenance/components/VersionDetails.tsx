import type { LineageVersion } from "../../../../../shared/types/provenance";
import { formatFileSize } from "../../file-browser/helpers/formatFileSize";

interface VersionDetailsProps {
  shotCode: string;
  step: string;
  version: LineageVersion;
  onClose: () => void;
}

export function VersionDetails({
  shotCode,
  step,
  version,
  onClose,
}: VersionDetailsProps) {
  const { credit } = version;

  return (
    <aside className="version-details">
      <header className="version-details__header">
        <h2>
          {shotCode} · {step} · {version.label}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <h3>Worked on by</h3>
      {!credit && (
        <p className="provenance-page__note">
          Unknown. No ShotGrid version matches this file version.
        </p>
      )}
      {credit && (
        <dl className="version-details__facts">
          <dt>Assigned to task</dt>
          <dd>
            {credit.assignees.join(", ") || "—"}
            {credit.task ? ` (${credit.task})` : ""}
          </dd>
          <dt>Artist on version</dt>
          <dd>{credit.artist ?? "—"}</dd>
          <dt>Published by</dt>
          <dd>{credit.publishedBy ?? "—"}</dd>
          <dt>Status</dt>
          <dd>{credit.status ?? "—"}</dd>
          <dt>Published</dt>
          <dd>
            {credit.createdAt
              ? new Date(credit.createdAt).toLocaleString()
              : "—"}
          </dd>
          <dt>Description</dt>
          <dd>{credit.description ?? "—"}</dd>
        </dl>
      )}

      <h3>Files</h3>
      {version.isApproved && (
        <p className="provenance-page__note">
          ★ A copy is in an approved folder.
        </p>
      )}
      {version.files.map((file) => (
        <div key={file.key} className="version-details__file" title={file.key}>
          <span className="version-details__file-name">{file.name}</span>
          <span className="provenance-page__note">
            {formatFileSize(file.sizeBytes)} ·{" "}
            {new Date(file.lastModified).toLocaleDateString()}
          </span>
          <span className="provenance-page__note version-details__file-path">
            {file.key}
          </span>
        </div>
      ))}
    </aside>
  );
}
