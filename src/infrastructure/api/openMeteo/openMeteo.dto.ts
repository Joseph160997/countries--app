/** Respuesta cruda de Open-Meteo (solo el bloque `current` que usamos). */
export interface OpenMeteoResponse {
  readonly current: {
    readonly time: string;
    readonly temperature_2m: number;
    readonly relative_humidity_2m: number;
    readonly weather_code: number; // código WMO
    readonly wind_speed_10m: number;
    readonly is_day: number; // 1 = día, 0 = noche
  };
}
