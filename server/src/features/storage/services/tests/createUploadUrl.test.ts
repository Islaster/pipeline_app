import { HeadObjectCommand, NotFound } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";
import { s3Client } from "../../config/s3Client";
import { createUploadUrl } from "../createUploadUrl";

const s3Mock = mockClient(s3Client);
const newFile = {
  folder: "Assets/Props/",
  fileName: "sword.png",
  sizeBytes: 1024,
};

describe("createUploadUrl", () => {
  beforeEach(() => s3Mock.reset());

  it("returns an upload link for a new file", async () => {
    s3Mock
      .on(HeadObjectCommand)
      .rejects(new NotFound({ message: "Not found", $metadata: {} }));

    const upload = await createUploadUrl(newFile);

    expect(upload.key).toBe("Assets/Props/sword.png");
    expect(upload.uploadUrl).toContain("Assets/Props/sword.png");
  });

  it("refuses to replace a file that already exists", async () => {
    s3Mock.on(HeadObjectCommand).resolves({});

    await expect(createUploadUrl(newFile)).rejects.toThrow("already exists");
  });

  it("refuses uploads with no folder", async () => {
    await expect(createUploadUrl({ ...newFile, folder: "" })).rejects.toThrow(
      "Choose a folder"
    );
  });
});
