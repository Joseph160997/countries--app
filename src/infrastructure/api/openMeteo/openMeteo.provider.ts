import { err, ok, type Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import type { WeatherData } from "@/domain/weather";
import type { WeatherProvider } from "@/domain/ports/weather.provider";
import { httpClient } from "@/infrastructure/http/http.client";
import type { OpenMeteoResponse } from "./openMeteo.dto";
import { mapToWeatherData } from "./openMeteo.mapper";
import { isOpenMeteoResponse } from "./openMeteo.validator";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Adapter: implementa WeatherProvider contra Open-Meteo.
 * Sin API key. Si falla, retorna err — nunca lanza.
 */
export class OpenMeteoProvider implements WeatherProvider {
  async getCurrentWeather(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<Result<WeatherData, AppError>> {
    const url =
      `${BASE_URL}?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day` +
      `&timezone=auto`;
    try {
      const response = await httpClient<OpenMeteoResponse>(
        url,
        { validator: isOpenMeteoResponse, signal },
        6000,
      );
      return ok(mapToWeatherData(response));
    } catch (error) {
      return err({
        kind: "network",
        message: "Weather service unavailable",
        cause: error,
      });
    }
  }
}
