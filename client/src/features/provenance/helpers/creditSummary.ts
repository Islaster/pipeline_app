import type { LineageCredit } from "../../../../../shared/types/provenance";

// The short "who" shown on a tree node. Task assignees come first, because the
// version itself may have been published by a shared account.
export function summarizeCredit(credit: LineageCredit | null): string {
  if (!credit) return "Unknown";
  if (credit.assignees.length > 0) return credit.assignees.join(", ");
  return credit.artist ?? credit.publishedBy ?? "Unknown";
}
