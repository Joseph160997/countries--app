import type { Country } from "@/domain/country";
import { createStore, type Store } from "../state/store";

export interface ModalSliceState {
  selectedCountry: Country | null;
}

export type ModalStore = Store<ModalSliceState>;

export const createModalSlice = (): ModalStore =>
  createStore<ModalSliceState>({ selectedCountry: null });
