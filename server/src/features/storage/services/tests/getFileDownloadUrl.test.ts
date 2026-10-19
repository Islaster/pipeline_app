import { describe, expect, it } from "vitest";
import { getFileDownloadUrl } from "../getFileDownloadUrl";

// Signing happens locally, so no S3 mock is needed here.
describe("getFileDownloadUrl", () => {
  it("creates a temporary link to the file", async () => {
    const url = new URL(await getFileDownloadUrl("scenes/intro/cut.mp4"));

    expect(url.hostname).toContain("test-bucket");
    expect(url.pathname).toBe("/scenes/intro/cut.mp4");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(url.searchParams.has("X-Amz-Signature")).toBe(true);
  });

  it("links to a specific version when one is requested", async () => {
    const url = new URL(
      await getFileDownloadUrl("scenes/cut.mp4", { versionId: "v1" })
    );

    expect(url.searchParams.get("versionId")).toBe("v1");
  });
  it("can mark the link as a download instead of a preview", async () => {
    const url = new URL(
      await getFileDownloadUrl("scenes/cut.mp4", { asAttachment: true })
    );

    expect(url.searchParams.get("response-content-disposition")).toContain(
      "attachment"
    );
    expect(url.searchParams.get("response-content-disposition")).toContain(
      "cut.mp4"
    );
  });
});
