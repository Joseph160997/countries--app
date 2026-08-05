import type { WikipediaSummaryResponse } from "./wikipedia.dto";

export function isWikipediaSummary(
  value: unknown,
): value is WikipediaSummaryResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.title === "string" && typeof v.extract === "string";
}
