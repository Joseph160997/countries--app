import type { Country } from "@/domain/country";
import { createStore, type Store } from "../state/store";

/** Cuántos países mostramos por "página" en el DOM. */
export const PAGE_SIZE = 20;

export interface CountriesSliceState {
  /** Lista COMPLETA de países cargados — la fuente de verdad de los datos. */
  all: Country[];
  isLoading: boolean;
  /** Ventana de paginación: cuántos países están visibles ahora mismo. */
  visibleCount: number;
}

export type CountriesStore = Store<CountriesSliceState>;

/** Crea un slice de estado de paíseses */
export const createCountriesSlice = (): CountriesStore =>
  createStore<CountriesSliceState>({
    all: [],
    isLoading: false,
    visibleCount: PAGE_SIZE,
  });
