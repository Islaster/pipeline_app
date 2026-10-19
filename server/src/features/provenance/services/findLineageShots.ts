import { getFileIndex } from "../../storage/services/fileIndex";
import { provenanceConfig } from "../config/provenanceConfig";
import { parseProductionFileName } from "../helpers/parseProductionFileName";

export interface LineageShotList {
  sequences: string[]; // every sequence that has versioned files, e.g. "006_HKA"
  shots: string[]; // matching shot codes, capped
  totalMatches: number;
}

// "006_HKA_0820" -> "006_HKA"
function sequenceOf(shotCode: string): string {
  return shotCode.slice(0, shotCode.lastIndexOf("_"));
}

// Shots and sequences found in storage file names, narrowed by sequence and typed text.
export function findLineageShots(
  query: string,
  sequence: string | null
): LineageShotList {
  const wanted = query.trim().toUpperCase();
  const shotCodes = new Set<string>();
  const sequences = new Set<string>();

  for (const file of getFileIndex().files) {
    const parsed = parseProductionFileName(file.name);
    if (!parsed) continue;
    sequences.add(sequenceOf(parsed.shotCode));
    if (sequence && sequenceOf(parsed.shotCode) !== sequence) continue;
    if (parsed.shotCode.includes(wanted)) shotCodes.add(parsed.shotCode);
  }

  const matches = [...shotCodes].sort();
  return {
    sequences: [...sequences].sort(),
    shots: matches.slice(0, provenanceConfig.shotSearchLimit),
    totalMatches: matches.length,
  };
}
