import type { Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import type { WeatherData } from "@/domain/weather";

/**
 * Puerto: obtener el clima actual de unas coordenadas.
 * El dominio define el QUÉ; Open-Meteo (u otro) decide el CÓMO.
 */
export interface WeatherProvider {
  getCurrentWeather(
    lat: number,
    lng: number,
  ): Promise<Result<WeatherData, AppError>>;
}
