export async function requestUploadUrl(
  folder: string,
  file: File
): Promise<string> {
  const response = await fetch("/api/storage/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, fileName: file.name, sizeBytes: file.size }),
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      details?.error ?? `The upload could not start (${response.status})`
    );
  }
  return ((await response.json()) as { uploadUrl: string }).uploadUrl;
}

// Sends the file straight to storage. XMLHttpRequest is used because it reports progress.
export function sendFileToStorage(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.floor((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`Storage refused the upload (${request.status})`));
    };
    request.onerror = () => reject(new Error("The upload was interrupted."));

    request.send(file);
  });
}

// Tells the server a file has arrived, so everyone's view updates without waiting for S3.
export async function reportUploadComplete(key: string): Promise<void> {
  await fetch("/api/storage/upload-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
}
