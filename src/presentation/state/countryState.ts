import type { Country, Region } from "@/domain/country";
import type { CountryRepository } from "@/domain/ports/country.repository";
import { isErr, isOk } from "@/shared/result";
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
import { createModalSlice, type ModalStore } from "../slices/modal.slice";
import type { WeatherProvider } from "@/domain/ports/weather.provider";

// ========================================================
// 1. DEPENDENCIA + SLICES (el estado ya no vive aquí)
// ========================================================
let countryRepository: CountryRepository | null = null;
let weatherProvider: WeatherProvider | null = null;

const countriesStore: CountriesStore = createCountriesSlice();
const filtersStore: FiltersStore = createFiltersSlice();

// Modal y favoritos aún viven aquí — el Step 2.3 los extrae a sus propios slices.
const modalStore: ModalStore = createModalSlice();

/** Caché del resultado derivado — se recalcula en cada cambio relevante. */
let filteredCountries: Country[] = [];

let listeners: Array<() => void> = [];

const SORT_KEY = "World_Explorer_Sort";

export const initCountryState = (repository: CountryRepository): void => {
  countryRepository = repository;
};

export const initWeatherProvider = (provider: WeatherProvider): void => {
  weatherProvider = provider;
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

export const getSelectedCountry = (): Country | null =>
  modalStore.getState().selectedCountry;

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
  if (!country) return;

  const willFetchWeather = Boolean(
    weatherProvider && country.capitalCoordinates,
  );
  modalStore.setState({
    selectedCountry: country,
    weather: null,
    weatherStatus: willFetchWeather ? "loading" : "idle",
  });
  notify();

  if (willFetchWeather) void loadWeather(country);
};

const loadWeather = async (country: Country): Promise<void> => {
  if (!weatherProvider || !country.capitalCoordinates) return;
  const { lat, lng } = country.capitalCoordinates;
  const result = await weatherProvider.getCurrentWeather(lat, lng);

  // Guard de carrera: el usuario pudo cerrar o abrir OTRO país
  // mientras el fetch volaba. Si ya no es el mismo país, descartamos.
  if (modalStore.getState().selectedCountry?.cca3 !== country.cca3) return;

  if (isOk(result)) {
    modalStore.setState({ weather: result.value, weatherStatus: "ready" });
  } else {
    modalStore.setState({ weatherStatus: "error" });
  }
  notify();
};

export const closeCountryModal = (): void => {
  modalStore.setState({
    selectedCountry: null,
    weather: null,
    weatherStatus: "idle",
  });
  notify();
};

export const getWeather = () => modalStore.getState().weather;
export const getWeatherStatus = () => modalStore.getState().weatherStatus;

export const getBorderNames = (codes: string[]): string[] =>
  codes.map((code) => {
    const found = countriesStore.getState().all.find((c) => c.cca3 === code);
    return found ? found.name : code;
  });

export const resetState = (): void => {
  countriesStore.reset();
  filtersStore.reset();
  modalStore.reset();
  filteredCountries = [];
  listeners = [];
};
