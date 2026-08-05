import type { Country } from "@/domain/country";
import type { WeatherData } from "@/domain/weather";
import type { WikiSummary } from "@/domain/wiki";
import { createStore, type Store } from "../state/store";

/** Ciclo de vida compartido por datos asíncronos (clima, wiki, futuros). */
export type AsyncStatus = "idle" | "loading" | "ready" | "error";

export interface ModalSliceState {
  selectedCountry: Country | null;
  weather: WeatherData | null;
  weatherStatus: AsyncStatus;
  wiki: WikiSummary | null;
  wikiStatus: AsyncStatus;
}

export type ModalStore = Store<ModalSliceState>;

export const createModalSlice = (): ModalStore =>
  createStore<ModalSliceState>({
    selectedCountry: null,
    weather: null,
    weatherStatus: "idle",
    wiki: null,
    wikiStatus: "idle",
  });
