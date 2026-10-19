import { ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";
import { listFileVersions } from "../listFileVersions";
import { s3Client } from "../../config/s3Client";

const s3Mock = mockClient(s3Client);

describe("listFileVersions", () => {
  beforeEach(() => s3Mock.reset());

  it("maps S3 versions to stored file versions", async () => {
    s3Mock.on(ListObjectVersionsCommand).resolves({
      Versions: [
        {
          Key: "scenes/cut.mp4",
          VersionId: "v2",
          Size: 4096,
          LastModified: new Date("2026-02-01T09:00:00.000Z"),
          IsLatest: true,
        },
      ],
    });

    const versions = await listFileVersions("scenes/cut.mp4");

    expect(versions).toEqual([
      {
        versionId: "v2",
        sizeBytes: 4096,
        lastModified: "2026-02-01T09:00:00.000Z",
        isLatest: true,
      },
    ]);
  });

  it("ignores other files that share the same prefix", async () => {
    s3Mock.on(ListObjectVersionsCommand).resolves({
      Versions: [
        { Key: "scenes/cut.mp4", VersionId: "v1" },
        { Key: "scenes/cut.mp4.backup", VersionId: "other" },
      ],
    });

    const versions = await listFileVersions("scenes/cut.mp4");

    expect(versions.map((version) => version.versionId)).toEqual(["v1"]);
  });

  it("returns an empty list when the file has no versions", async () => {
    s3Mock.on(ListObjectVersionsCommand).resolves({});

    expect(await listFileVersions("missing.mp4")).toEqual([]);
  });
});
