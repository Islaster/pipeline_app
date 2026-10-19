import type { StoredFile } from "../../../../../shared/types/storedFile";
import { fetchDownloadUrl } from "../api/storageApi";

// Gets a temporary link for the file and hands it to the browser's downloader.
export async function downloadStoredFile(file: StoredFile): Promise<void> {
  const url = await fetchDownloadUrl(file.key, true);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.rel = "noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
}
