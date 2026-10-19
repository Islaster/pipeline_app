import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { getFileDownloadUrl } from "./services/getFileDownloadUrl";
import { listFileVersions } from "./services/listFileVersions";
import { listStoredFiles } from "./services/listStoredFiles";

vi.mock("./services/listStoredFiles");
vi.mock("./services/listFileVersions");
vi.mock("./services/getFileDownloadUrl");
vi.mock("../auth/middleware/requireSignedIn", () => ({
  requireSignedIn: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

describe("storageRoutes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/storage/files", () => {
    it("returns a page of files", async () => {
      const page = { folders: [], files: [], nextCursor: null };
      vi.mocked(listStoredFiles).mockResolvedValue(page);

      const response = await request(app).get("/api/storage/files");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(page);
    });

    it("passes folder and cursor through", async () => {
      vi.mocked(listStoredFiles).mockResolvedValue({
        folders: [],
        files: [],
        nextCursor: null,
      });

      await request(app).get("/api/storage/files?folder=scenes/&cursor=abc");

      expect(listStoredFiles).toHaveBeenCalledWith({
        folder: "scenes/",
        cursor: "abc",
      });
    });
  });

  describe("GET /api/storage/versions", () => {
    it("returns 400 when key is missing", async () => {
      const response = await request(app).get("/api/storage/versions");

      expect(response.status).toBe(400);
      expect(listFileVersions).not.toHaveBeenCalled();
    });

    it("returns the versions for a file", async () => {
      const versions = [
        {
          versionId: "v1",
          sizeBytes: 10,
          lastModified: "2026-01-01T00:00:00.000Z",
          isLatest: true,
        },
      ];
      vi.mocked(listFileVersions).mockResolvedValue(versions);

      const response = await request(app).get(
        "/api/storage/versions?key=scenes/cut.mp4"
      );

      expect(response.body).toEqual(versions);
      expect(listFileVersions).toHaveBeenCalledWith("scenes/cut.mp4");
    });
  });

  describe("GET /api/storage/download-url", () => {
    it("returns 400 when key is missing", async () => {
      const response = await request(app).get("/api/storage/download-url");

      expect(response.status).toBe(400);
    });

    it("returns a download link for the requested version", async () => {
      vi.mocked(getFileDownloadUrl).mockResolvedValue(
        "https://example.com/signed"
      );

      const response = await request(app).get(
        "/api/storage/download-url?key=scenes/cut.mp4&versionId=v1"
      );

      expect(response.body).toEqual({ url: "https://example.com/signed" });
      expect(getFileDownloadUrl).toHaveBeenCalledWith("scenes/cut.mp4", {
        versionId: "v1",
        asAttachment: false,
      });
    });
    it("asks for a saved-to-disk link when attachment is requested", async () => {
      vi.mocked(getFileDownloadUrl).mockResolvedValue(
        "https://example.com/signed"
      );

      await request(app).get(
        "/api/storage/download-url?key=scenes/cut.mp4&attachment=1"
      );

      expect(getFileDownloadUrl).toHaveBeenCalledWith("scenes/cut.mp4", {
        versionId: undefined,
        asAttachment: true,
      });
    });
  });
});
