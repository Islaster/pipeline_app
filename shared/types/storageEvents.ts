// Sent to every open browser whenever a folder's contents change.
export interface StorageChange {
  folders: string[]; // the folders that changed, e.g. ["Assets/Characters/"]
}
