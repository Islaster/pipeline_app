import { describe, expect, it, vi } from "vitest";
import { getFileIndex } from "../fileIndex";
import { searchFiles } from "../searchFiles";

vi.mock("../fileIndex");

function fileAt(key: string) {
  return {
    key,
    name: key.split("/").pop() ?? "",
    sizeBytes: 1,
    lastModified: "",
  };
}

function indexContains(keys: string[]) {
  vi.mocked(getFileIndex).mockReturnValue({
    files: keys.map(fileAt),
    folders: [],
    isReady: true,
  });
}

describe("searchFiles", () => {
  it("finds files in any folder, matching words in any order", () => {
    indexContains(["Assets/Characters/000_AHK_0300.png", "dev/notes.txt"]);

    const results = searchFiles("0300 ahk");

    expect(results.files.map((file) => file.key)).toEqual([
      "Assets/Characters/000_AHK_0300.png",
    ]);
  });

  it("returns nothing for an empty search", () => {
    indexContains(["dev/notes.txt"]);

    expect(searchFiles("  ").files).toEqual([]);
  });

  it("caps the results but reports the full match count", () => {
    indexContains(
      Array.from({ length: 250 }, (_, index) => `dev/shot_${index}.png`)
    );

    const results = searchFiles("shot");

    expect(results.files).toHaveLength(200);
    expect(results.totalMatches).toBe(250);
  });
  it("matches file names, not the folders they live in", () => {
    indexContains(["Characters/sheet.png", "dev/characters_list.txt"]);

    const results = searchFiles("characters");

    expect(results.files.map((file) => file.key)).toEqual([
      "dev/characters_list.txt",
    ]);
  });
  it("returns the one file whose full path was pasted", () => {
    indexContains(["Post_Office/From Prod/shot 01.mov", "dev/shot 01.mov"]);

    const results = searchFiles("Post_Office/From Prod/shot 01.mov");

    expect(results.files.map((file) => file.key)).toEqual([
      "Post_Office/From Prod/shot 01.mov",
    ]);
    expect(results.totalMatches).toBe(1);
  });
  it("returns only files inside the chosen folder", () => {
    indexContains([
      "Scene_Bin/006_HKA/shot_lay.mp4",
      "Scene_Bin/007_ABC/shot_lay.mp4",
    ]);

    const results = searchFiles("", { withinFolder: "Scene_Bin/006_HKA/" });

    expect(results.files.map((file) => file.key)).toEqual([
      "Scene_Bin/006_HKA/shot_lay.mp4",
    ]);
  });
  it("finds character sheets by csh in the file name", () => {
    indexContains([
      "Assets/000_AHK_0300_csh_30N_v0001.png",
      "Assets/docsheet.pdf",
    ]);

    const results = searchFiles("", { assetType: "characterSheets" });

    expect(results.files.map((file) => file.key)).toEqual([
      "Assets/000_AHK_0300_csh_30N_v0001.png",
    ]);
  });

  it("finds props by props in the file path", () => {
    indexContains(["Assets/Props/sword.png", "Assets/Characters/hero.png"]);

    const results = searchFiles("", { assetType: "props" });

    expect(results.files.map((file) => file.key)).toEqual([
      "Assets/Props/sword.png",
    ]);
  });
});
