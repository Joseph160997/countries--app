import type { Country, Region } from "@/domain/country";
import type { CountryRepository } from "@/domain/ports/country.repository";
import { isErr } from "@/shared/result";
import { toggleFavoritePersistence } from "@/presentation/services/favoriteService";
import { storageService } from "@/infrastructure/persistence/localStorage.store";
import {
  createCountriesSlice,
  PAGE_SIZE,
  type CountriesStore,
} from "../slices/countries.slice";
import {
  createFiltersSlice,
  type FiltersStore,
  type SortCriteria,
} from "../slices/filters.slice";
import { computeFilteredCountries } from "../slices/explorer.selectors";

// ========================================================
// 1. DEPENDENCIA + SLICES (el estado ya no vive aquí)
// ========================================================
let countryRepository: CountryRepository | null = null;

const countriesStore: CountriesStore = createCountriesSlice();
const filtersStore: FiltersStore = createFiltersSlice();

// Modal y favoritos aún viven aquí — el Step 2.3 los extrae a sus propios slices.
let selectedCountry: Country | null = null;

/** Caché del resultado derivado — se recalcula en cada cambio relevante. */
let filteredCountries: Country[] = [];

let listeners: Array<() => void> = [];

const SORT_KEY = "World_Explorer_Sort";

export const initCountryState = (repository: CountryRepository): void => {
  countryRepository = repository;
};

// ========================================================
// 2. MOTOR DE DERIVACIÓN (ahora delega en el selector puro)
// ========================================================
const applyFilters = (): void => {
  filteredCountries = computeFilteredCountries(
    countriesStore.getState().all,
    filtersStore.getState(),
  );
  // Reset de la ventana de paginación cuando cambian los filtros
  countriesStore.setState({ visibleCount: PAGE_SIZE });
  notify();
};

// ========================================================
// 3. REACTIVIDAD
// ========================================================
const notify = (): void => {
  listeners.forEach((listener) => listener());
};

export const subscribe = (callback: () => void): (() => void) => {
  listeners.push(callback);
  // Comportamiento heredado: se preserva por equivalencia.
  if (filteredCountries.length > 0) callback();
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

// ========================================================
// 4. SELECTORES
// ========================================================
export const getIsLoading = (): boolean => countriesStore.getState().isLoading;

export const getCountries = (): Country[] =>
  filteredCountries.slice(0, countriesStore.getState().visibleCount);

export const hasMore = (): boolean =>
  countriesStore.getState().visibleCount < filteredCountries.length;

export const getFilteredTotal = (): number => filteredCountries.length;

export const getSelectedCountry = (): Country | null => selectedCountry;

export const isShowingFavoritesActive = (): boolean =>
  filtersStore.getState().showFavorites;

export const getSort = (): SortCriteria => filtersStore.getState().sort;

// ========================================================
// 5. ACCIONES
// ========================================================
export const loadCountries = async (favoriteCodes: string[]): Promise<void> => {
  if (!countryRepository) {
    throw new Error(
      "[State] Debes llamar a initCountryState() antes de loadCountries()",
    );
  }
  countriesStore.setState({ isLoading: true });
  notify();
  try {
    const result = await countryRepository.getAll(favoriteCodes);
    if (isErr(result)) {
      console.error(
        "[Estado] Error en la carga coordinada:",
        result.error.message,
      );
    } else {
      countriesStore.setState({ all: result.value });
      applyFilters();
    }
  } finally {
    countriesStore.setState({ isLoading: false });
    notify();
  }
};

export const loadMore = (): void => {
  const { visibleCount } = countriesStore.getState();
  countriesStore.setState({
    visibleCount: Math.min(visibleCount + PAGE_SIZE, filteredCountries.length),
  });
  notify();
};

export const setSearchQuery = (text: string): void => {
  filtersStore.setState({ query: text });
  applyFilters();
};

export const setRegionFilter = (region: Region): void => {
  filtersStore.setState({ region });
  applyFilters();
};

export const toggleCountryFavorite = (cca3: string): void => {
  const nowIsFavorite = toggleFavoritePersistence(cca3);
  const { all } = countriesStore.getState();
  countriesStore.setState({
    all: all.map((c) =>
      c.cca3 === cca3 ? { ...c, isFavorite: nowIsFavorite } : c,
    ),
  });
  applyFilters();
};

export const toggleShowFavorites = (): void => {
  const { showFavorites } = filtersStore.getState();
  filtersStore.setState({ showFavorites: !showFavorites });
  applyFilters();
};

export const setSort = (criteria: SortCriteria): void => {
  filtersStore.setState({ sort: criteria });
  storageService.save(SORT_KEY, criteria);
  applyFilters();
};

export const initSort = (): void => {
  const savedSort = storageService.get<SortCriteria>(SORT_KEY);
  if (savedSort) filtersStore.setState({ sort: savedSort });
};

export const openCountryModal = (cca3: string): void => {
  const country = countriesStore.getState().all.find((c) => c.cca3 === cca3);
  if (country) {
    selectedCountry = country;
    notify();
  }
};

export const closeCountryModal = (): void => {
  selectedCountry = null;
  notify();
};

export const getBorderNames = (codes: string[]): string[] =>
  codes.map((code) => {
    const found = countriesStore.getState().all.find((c) => c.cca3 === code);
    return found ? found.name : code;
  });

export const resetState = (): void => {
  countriesStore.reset();
  filtersStore.reset();
  selectedCountry = null;
  filteredCountries = [];
  listeners = [];
};
