import { provenanceConfig } from "../config/provenanceConfig";

export function isReviewTask(name: string, step: string | null): boolean {
  const text = `${name} ${step ?? ""}`.toLowerCase();
  return provenanceConfig.reviewTaskWords.some((word) => text.includes(word));
}
