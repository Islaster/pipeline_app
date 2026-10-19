import { describe, expect, it, vi } from "vitest";
import { getFileIndex } from "../fileIndex";
import { searchFolders } from "../searchFolders";

vi.mock("../fileIndex");

function indexContains(paths: string[]) {
  const folders = paths.map((path) => ({
    path,
    name: path.split("/").filter(Boolean).pop() ?? "",
  }));
  vi.mocked(getFileIndex).mockReturnValue({
    files: [],
    folders,
    isReady: true,
  });
}

describe("searchFolders", () => {
  it("matches folder names, not the folders above them", () => {
    indexContains(["Assets/Characters/", "Assets/Characters/Background/"]);

    const results = searchFolders("characters");

    expect(results.folders.map((folder) => folder.path)).toEqual([
      "Assets/Characters/",
    ]);
    expect(results.files).toEqual([]);
  });

  it("returns nothing for an empty search", () => {
    indexContains(["dev/"]);

    expect(searchFolders("").folders).toEqual([]);
  });
});
