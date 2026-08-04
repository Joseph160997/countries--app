/** Lo que la app necesita del clima — independiente de Open-Meteo. */
export interface WeatherData {
  readonly temperatureC: number;
  readonly humidity: number;
  readonly windSpeedKmh: number;
  readonly condition: string; // "Partly cloudy"
  readonly icon: string; // "⛅"
}
