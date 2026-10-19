import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";
import { listStoredFiles } from "../listStoredFiles";
import { s3Client } from "../../config/s3Client";

const s3Mock = mockClient(s3Client);

describe("listStoredFiles", () => {
  beforeEach(() => s3Mock.reset());

  it("maps S3 objects to stored files", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({
      Contents: [
        {
          Key: "scenes/intro/cut.mp4",
          Size: 2048,
          LastModified: new Date("2026-01-15T10:00:00.000Z"),
        },
      ],
    });

    const page = await listStoredFiles();

    expect(page.files).toEqual([
      {
        key: "scenes/intro/cut.mp4",
        name: "cut.mp4",
        sizeBytes: 2048,
        lastModified: "2026-01-15T10:00:00.000Z",
      },
    ]);
  });

  it("returns an empty page when the bucket has no files", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({});

    const page = await listStoredFiles();

    expect(page).toEqual({ folders: [], files: [], nextCursor: null });
  });

  it("returns the cursor for the next page", async () => {
    s3Mock
      .on(ListObjectsV2Command)
      .resolves({ NextContinuationToken: "next-page" });

    const page = await listStoredFiles();

    expect(page.nextCursor).toBe("next-page");
  });

  it("sends folder, cursor, and page size to S3", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({});

    await listStoredFiles({ folder: "scenes/", cursor: "abc", pageSize: 25 });

    const input = s3Mock.commandCalls(ListObjectsV2Command)[0]?.args[0].input;
    expect(input).toMatchObject({
      Bucket: "test-bucket",
      Prefix: "scenes/",
      ContinuationToken: "abc",
      MaxKeys: 25,
    });
  });

  it("defaults to 100 files per page", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({});

    await listStoredFiles();

    const input = s3Mock.commandCalls(ListObjectsV2Command)[0]?.args[0].input;
    expect(input?.MaxKeys).toBe(100);
  });
  it("returns subfolders of the current folder", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({
      CommonPrefixes: [{ Prefix: "Assets/Characters/" }],
    });

    const page = await listStoredFiles({ folder: "Assets/" });

    expect(page.folders).toEqual([
      { path: "Assets/Characters/", name: "Characters" },
    ]);
  });

  it("hides folder markers and placeholder files", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({
      Contents: [
        { Key: "Assets/" },
        { Key: "Assets/.bzEmpty" },
        { Key: "Assets/sheet.png" },
      ],
    });

    const page = await listStoredFiles({ folder: "Assets/" });

    expect(page.files.map((file) => file.name)).toEqual(["sheet.png"]);
  });

  it("adds a trailing slash to the folder when missing", async () => {
    s3Mock.on(ListObjectsV2Command).resolves({});

    await listStoredFiles({ folder: "Assets/Characters" });

    const input = s3Mock.commandCalls(ListObjectsV2Command)[0]?.args[0].input;
    expect(input).toMatchObject({
      Prefix: "Assets/Characters/",
      Delimiter: "/",
    });
  });
});
