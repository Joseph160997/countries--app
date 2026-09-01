import type { Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import type { WeatherData } from "@/domain/weather";

/**
 * Puerto: obtener el clima actual de unas coordenadas.
 * El dominio define el QUÉ; Open-Meteo (u otro) decide el CÓMO.
 *
 * `signal` es opcional: permite al caller abortar la petición
 * (ej: el usuario cierra el modal mientras el fetch vuela).
 */
export interface WeatherProvider {
  getCurrentWeather(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<Result<WeatherData, AppError>>;
}
