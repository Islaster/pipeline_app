import type { UploadItem } from "../helpers/uploads";

interface UploadTrayProps {
  uploads: UploadItem[];
  onClearFinished: () => void;
}

export function UploadTray({ uploads, onClearFinished }: UploadTrayProps) {
  if (uploads.length === 0) return null;

  return (
    <aside className="upload-tray" aria-live="polite">
      <header className="upload-tray__header">
        <strong>Uploads</strong>
        <button type="button" onClick={onClearFinished}>
          Clear finished
        </button>
      </header>
      {uploads.map((upload) => (
        <div key={upload.id} className="upload-tray__item">
          <span
            className="upload-tray__name"
            title={`${upload.folder}${upload.fileName}`}
          >
            {upload.fileName}
          </span>
          {upload.status === "uploading" && (
            <progress
              className="upload-tray__progress"
              max={100}
              value={upload.percent}
            />
          )}
          {upload.status === "done" && (
            <span className="upload-tray__done">Uploaded</span>
          )}
          {upload.status === "failed" && (
            <span className="form-error">{upload.error}</span>
          )}
        </div>
      ))}
    </aside>
  );
}
