import { describe, expect, it } from "vitest";
import { mapToWeatherData } from "./openMeteo.mapper";
import type { OpenMeteoResponse } from "./openMeteo.dto";

const baseResponse: OpenMeteoResponse = {
  current: {
    time: "2026-08-04T15:00",
    temperature_2m: 21.3,
    relative_humidity_2m: 65,
    weather_code: 2,
    wind_speed_10m: 8.2,
    is_day: 1,
  },
};

describe("mapToWeatherData", () => {
  it("should map a known WMO code to label and icon", () => {
    const result = mapToWeatherData(baseResponse);
    expect(result.temperatureC).toBe(21.3);
    expect(result.humidity).toBe(65);
    expect(result.windSpeedKmh).toBe(8.2);
    expect(result.condition).toBe("Partly cloudy");
    expect(result.icon).toBe("⛅");
  });

  it("should use the night icon when is_day is 0", () => {
    const night: OpenMeteoResponse = {
      ...baseResponse,
      current: { ...baseResponse.current, weather_code: 0, is_day: 0 },
    };
    expect(mapToWeatherData(night).icon).toBe("🌙");
  });

  it("should fall back for unknown WMO codes", () => {
    const unknown: OpenMeteoResponse = {
      ...baseResponse,
      current: { ...baseResponse.current, weather_code: 999 },
    };
    const result = mapToWeatherData(unknown);
    expect(result.condition).toBe("Unknown");
    expect(result.icon).toBe("🌡️");
  });
});
