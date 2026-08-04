import type { WeatherData } from "@/domain/weather";
import type { OpenMeteoResponse } from "./openMeteo.dto";

interface WeatherCondition {
  label: string;
  icon: string;
  nightIcon?: string;
}

const WMO_CODES: Record<number, WeatherCondition> = {
  0: { label: "Clear sky", icon: "☀️", nightIcon: "🌙" },
  1: { label: "Mainly clear", icon: "🌤️", nightIcon: "🌙" },
  2: { label: "Partly cloudy", icon: "⛅", nightIcon: "☁️" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Icy fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Light showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with hail", icon: "⛈️" },
  99: { label: "Thunderstorm with hail", icon: "⛈️" },
};

const FALLBACK: WeatherCondition = { label: "Unknown", icon: "🌡️" };

export const mapToWeatherData = (dto: OpenMeteoResponse): WeatherData => {
  const { current } = dto;
  const condition = WMO_CODES[current.weather_code] ?? FALLBACK;
  const isNight = current.is_day === 0;
  const icon =
    isNight && condition.nightIcon ? condition.nightIcon : condition.icon;

  return {
    temperatureC: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    condition: condition.label,
    icon,
  };
};
