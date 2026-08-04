import type { Country } from "@/domain/country";
import type { WeatherData } from "@/domain/weather";
import { createStore, type Store } from "../state/store";

export type WeatherStatus = "idle" | "loading" | "ready" | "error";

export interface ModalSliceState {
  selectedCountry: Country | null;
  weather: WeatherData | null;
  weatherStatus: WeatherStatus;
}

export type ModalStore = Store<ModalSliceState>;

export const createModalSlice = (): ModalStore =>
  createStore<ModalSliceState>({
    selectedCountry: null,
    weather: null,
    weatherStatus: "idle",
  });
