import type { StoredFile } from "../../../../../shared/types/storedFile";
import { getFolderPath, getVersionLabel } from "../helpers/fileNameDetails";
import { formatFileSize } from "../helpers/formatFileSize";
import { useFileDragOut } from "../hooks/useFileDragOut";
import { DownloadButton } from "./DownloadButton";
import { FileThumbnail } from "./FileThumbnail";

interface FileTileProps {
  file: StoredFile;
  isSelected: boolean;
  onSelect: (file: StoredFile) => void;
  showLocation: boolean;
}

export function FileTile({
  file,
  isSelected,
  onSelect,
  showLocation,
}: FileTileProps) {
  const versionLabel = getVersionLabel(file.name);
  const dragOut = useFileDragOut(file);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`file-tile${isSelected ? " file-tile--selected" : ""}`}
      title={showLocation ? file.key : file.name}
      onClick={() => onSelect(file)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(file);
        }
      }}
      {...dragOut}
    >
      <FileThumbnail file={file} />
      <span className="file-tile__footer">
        <span className="file-tile__text">
          <span className="file-tile__name">{file.name}</span>
          <span className="file-tile__meta">
            {versionLabel ? `${versionLabel} · ` : ""}
            {formatFileSize(file.sizeBytes)}
            {showLocation ? ` · ${getFolderPath(file.key) || "Top level"}` : ""}
          </span>
        </span>
        <DownloadButton file={file} />
      </span>
    </div>
  );
}
