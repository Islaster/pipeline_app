import { describe, expect, it } from "vitest";
import { parseProductionFileName } from "../parseProductionFileName";

describe("parseProductionFileName", () => {
  it("reads shot, step, vendor, and version", () => {
    expect(parseProductionFileName("006_hka_0820_lay_30N_v0006.mp4")).toEqual({
      shotCode: "006_HKA_0820",
      step: "lay",
      vendor: "30N",
      version: 6,
      versionLabel: "v0006",
    });
  });

  it("handles names with no vendor", () => {
    const parsed = parseProductionFileName("006_HKA_1090_bg01_v001.mov");

    expect(parsed).toMatchObject({ step: "bg01", vendor: null, version: 1 });
  });

  it("keeps multi-word steps together", () => {
    const parsed = parseProductionFileName(
      "006_HKA_1060_Count_Sheets_v002.pdf"
    );

    expect(parsed).toMatchObject({ step: "count_sheets", vendor: null });
  });

  it("returns null for names outside the pattern", () => {
    expect(parseProductionFileName("0J8A7644.JPG")).toBeNull();
    expect(parseProductionFileName("006_HKA_1060_sync_handles.mov")).toBeNull();
  });
});
