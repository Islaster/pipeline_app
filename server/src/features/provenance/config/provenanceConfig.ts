export const provenanceConfig = {
  vendorCodes: ["30N"], // name parts that mean "vendor", not "step"
  approvedFolderSuffix: "_approved",
  shotSearchLimit: 60,
  trackedProject: process.env.PROVENANCE_PROJECT ?? "KS", // Only this ShotGrid project gets a task trail. Matched against the project's code or name.
  stepAliases: {
    // Short step codes in file names → the ShotGrid step they belong to (lowercase both sides).
    lay: "layout",
    anim: "animation",
    sfa: "animation",
    ffs: "fx",
    comp: "comp",
    lgt: "lighting",
    vzo: "layout",
  } as Record<string, string>,
  reviewTaskWords: ["review"],
};
