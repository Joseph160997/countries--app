import type { OpenMeteoResponse } from "./openMeteo.dto";

export function isOpenMeteoResponse(
  value: unknown,
): value is OpenMeteoResponse {
  if (typeof value !== "object" || value === null) return false;
  const current = (value as { current?: unknown }).current;
  if (typeof current !== "object" || current === null) return false;
  const c = current as Record<string, unknown>;
  return (
    typeof c.temperature_2m === "number" && typeof c.weather_code === "number"
  );
}
