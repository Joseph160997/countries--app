import type { Region } from "@/domain/country";
import { createStore, type Store } from "../state/store";

export type SortCriteria = "none" | "population-desc" | "name-asc";

export interface FiltersSliceState {
  query: string;
  region: Region;
  showFavorites: boolean;
  /**
   * Reservado para el slider de población del roadmap (Fase 3+).
   * Hoy siempre es 0 — lo dejamos para no romper el motor de filtros.
   */
  minPopulation: number;
  sort: SortCriteria;
}

export type FiltersStore = Store<FiltersSliceState>;

export const createFiltersSlice = (): FiltersStore =>
  createStore<FiltersSliceState>({
    query: "",
    region: "",
    showFavorites: false,
    minPopulation: 0,
    sort: "none",
  });
