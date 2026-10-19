import { provenanceConfig } from "../config/provenanceConfig";

export interface ProductionFileName {
  shotCode: string; // "006_HKA_0820"
  step: string; // "lay"
  vendor: string | null; // "30N"
  version: number; // 6
  versionLabel: string; // "v0006"
}

// sequence number _ sequence code _ shot number _ step (and vendor) _ v + version
const namePattern = /^(\d{3})_([a-z]+)_(\d{4})_(.+?)_v(\d+)/i;

// "006_hka_0820_lay_30N_v0006.mp4" -> shot 006_HKA_0820, step lay, vendor 30N, version 6.
// Returns null for names that don't follow the pattern.
export function parseProductionFileName(
  fileName: string
): ProductionFileName | null {
  const match = namePattern.exec(fileName);
  if (!match) return null;

  const [, sequenceNumber, sequenceCode, shotNumber, middle, versionDigits] =
    match;
  if (
    !sequenceNumber ||
    !sequenceCode ||
    !shotNumber ||
    !middle ||
    !versionDigits
  )
    return null;

  const parts = middle.split("_");
  const lastPart = (parts.at(-1) ?? "").toUpperCase();
  const hasVendor =
    parts.length > 1 && provenanceConfig.vendorCodes.includes(lastPart);

  return {
    shotCode: `${sequenceNumber}_${sequenceCode.toUpperCase()}_${shotNumber}`,
    step: (hasVendor ? parts.slice(0, -1) : parts).join("_").toLowerCase(),
    vendor: hasVendor ? lastPart : null,
    version: Number(versionDigits),
    versionLabel: `v${versionDigits}`,
  };
}

// Identifies one node of a shot's tree, for matching storage files to ShotGrid versions.
export function versionKey(step: string, version: number): string {
  return `${step}|${version}`;
}
