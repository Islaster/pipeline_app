import { useState, type MouseEvent } from "react";
import type { StoredFile } from "../../../../../shared/types/storedFile";
import { downloadStoredFile } from "../helpers/downloadStoredFile";

interface DownloadButtonProps {
  file: StoredFile;
  showLabel?: boolean; // icon only on rows and tiles, icon plus "Download" in the preview panel
}

export function DownloadButton({
  file,
  showLabel = false,
}: DownloadButtonProps) {
  const [isStarting, setIsStarting] = useState(false);

  async function start(event: MouseEvent) {
    event.stopPropagation(); // don't also select the row
    setIsStarting(true);
    try {
      await downloadStoredFile(file);
    } catch {
      window.alert(`Could not download ${file.name}.`);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <button
      type="button"
      className={`download-button${
        showLabel ? " download-button--labelled" : ""
      }`}
      title={`Download ${file.name}`}
      aria-label={`Download ${file.name}`}
      disabled={isStarting}
      onClick={(event) => void start(event)}
    >
      ⬇{showLabel && " Download"}
    </button>
  );
}
