import type { Country } from "@/domain/country";
import { createStore, type Store } from "../state/store";

export const PAGE_SIZE = 20;

export interface CountriesSliceState {
  all: Country[];
  isLoading: boolean;
  currentPage: number;
}

export type CountriesStore = Store<CountriesSliceState>;

export const createCountriesSlice = (): CountriesStore =>
  createStore<CountriesSliceState>({
    all: [],
    isLoading: false,
    currentPage: 1,
  });
