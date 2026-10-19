// A refused upload, with a message that's safe to show the person.
export class UploadError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
