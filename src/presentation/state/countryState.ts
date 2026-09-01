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
import {
  computeFilteredCountries,
  buildHeroSlides,
  type HeroSlide,
} from "../slices/explorer.selectors";
import { createModalSlice, type ModalStore } from "../slices/modal.slice";
import type { WeatherProvider } from "@/domain/ports/weather.provider";
import type { WikiProvider } from "@/domain/ports/wiki.provider";
import {
  createComparisonSlice,
  type ComparisonStore,
} from "../slices/comparison.slice";

// ========================================================
// 1. DEPENDENCIA + SLICES (el estado ya no vive aquí)
// ========================================================
let countryRepository: CountryRepository | null = null;
let weatherProvider: WeatherProvider | null = null;
let wikiProvider: WikiProvider | null = null;

const countriesStore: CountriesStore = createCountriesSlice();
const filtersStore: FiltersStore = createFiltersSlice();

const modalStore: ModalStore = createModalSlice();

const comparisonStore: ComparisonStore = createComparisonSlice();

/** Caché del resultado derivado — se recalcula en cada cambio relevante. */
let filteredCountries: Country[] = [];

let listeners: Array<() => void> = [];
let modalSessionController: AbortController | null = null;

const SORT_KEY = "World_Explorer_Sort";

export const initCountryState = (repository: CountryRepository): void => {
  countryRepository = repository;
};

export const initWeatherProvider = (provider: WeatherProvider): void => {
  weatherProvider = provider;
};

export const initWikiProvider = (provider: WikiProvider): void => {
  wikiProvider = provider;
};

/** Slides del hero: País del Día + destacados curados. */
export const getHeroSlides = (): HeroSlide[] =>
  buildHeroSlides(countriesStore.getState().all);

// ========================================================
// 2. MOTOR DE DERIVACIÓN (ahora delega en el selector puro)
// ========================================================
const applyFilters = (): void => {
  filteredCountries = computeFilteredCountries(
    countriesStore.getState().all,
    filtersStore.getState(),
  );
  // Reset de la ventana de paginación cuando cambian los filtros
  countriesStore.setState({ currentPage: 1 });
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

/**
 * Selector: catálogo completo de países (sin filtros del grid).
 * El Command Palette necesita buscar en TODOS los países,
 * no solo en los que pasan los filtros de región/favoritos.
 */
export const getAllCountries = (): readonly Country[] =>
  countriesStore.getState().all;

export const getIsLoading = (): boolean => countriesStore.getState().isLoading;

export const getCountries = (): Country[] => {
  const { currentPage } = countriesStore.getState();
  const start = (currentPage - 1) * PAGE_SIZE;
  return filteredCountries.slice(start, start + PAGE_SIZE);
};

export const getCurrentPage = (): number =>
  countriesStore.getState().currentPage;

export const getTotalPages = (): number => {
  if (filteredCountries.length === 0) return 1;
  return Math.ceil(filteredCountries.length / PAGE_SIZE);
};

export const setPage = (page: number): void => {
  const clamped = Math.max(1, Math.min(page, getTotalPages()));
  countriesStore.setState({ currentPage: clamped });
  notify();
};

export const getFilteredTotal = (): number => filteredCountries.length;

export const getAllCountriesCount = (): number =>
  countriesStore.getState().all.length;

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

  modalSessionController?.abort();
  modalSessionController = new AbortController();
  const { signal } = modalSessionController;

  const willFetchWeather = Boolean(
    weatherProvider && country.capitalCoordinates,
  );
  const willFetchWiki = Boolean(wikiProvider && country.links?.wikipedia);

  modalStore.setState({
    selectedCountry: country,
    weather: null,
    weatherStatus: willFetchWeather ? "loading" : "idle",
    wiki: null,
    wikiStatus: willFetchWiki ? "loading" : "idle",
  });
  notify();

  if (willFetchWeather) void loadWeather(country, signal);
  if (willFetchWiki) void loadWiki(country, signal);
};

const loadWiki = async (
  country: Country,
  signal: AbortSignal,
): Promise<void> => {
  const url = country.links?.wikipedia;
  if (!wikiProvider || !url) return;
  const result = await wikiProvider.getSummaryFromUrl(url, signal);

  if (signal.aborted) return;
  if (modalStore.getState().selectedCountry?.cca3 !== country.cca3) return;

  if (isOk(result)) {
    modalStore.setState({ wiki: result.value, wikiStatus: "ready" });
  } else {
    modalStore.setState({ wikiStatus: "error" });
  }
  notify();
};

export const closeCountryModal = (): void => {
  modalSessionController?.abort();
  modalSessionController = null;

  modalStore.setState({
    selectedCountry: null,
    weather: null,
    weatherStatus: "idle",
    wiki: null,
    wikiStatus: "idle",
  });
  notify();
};

export const getWiki = () => modalStore.getState().wiki;
export const getWikiStatus = () => modalStore.getState().wikiStatus;
export const getWeather = () => modalStore.getState().weather;
export const getWeatherStatus = () => modalStore.getState().weatherStatus;

const loadWeather = async (
  country: Country,
  signal: AbortSignal,
): Promise<void> => {
  if (!weatherProvider || !country.capitalCoordinates) return;
  const { lat, lng } = country.capitalCoordinates;
  const result = await weatherProvider.getCurrentWeather(lat, lng, signal);

  if (signal.aborted) return;
  if (modalStore.getState().selectedCountry?.cca3 !== country.cca3) return;

  if (isOk(result)) {
    modalStore.setState({ weather: result.value, weatherStatus: "ready" });
  } else {
    modalStore.setState({ weatherStatus: "error" });
  }
  notify();
};

export const getBorderNames = (codes: string[]): string[] =>
  codes.map((code) => {
    const found = countriesStore.getState().all.find((c) => c.cca3 === code);
    return found ? found.name : code;
  });

// ========================================================
// 8. COMPARACIÓN — estado y acciones
// ========================================================

const COMPARISON_MAX = 3;

/** Selector: códigos seleccionados para comparar. */
export const getComparisonCodes = (): readonly string[] =>
  comparisonStore.getState().selectedCodes;

/** Selector: cuántos países hay seleccionados. */
export const getComparisonCount = (): number =>
  comparisonStore.getState().selectedCodes.length;

/** Selector: ¿la vista de comparación está abierta? */
export const getIsComparisonActive = (): boolean =>
  comparisonStore.getState().isActive;

/** Selector: ¿puedo añadir más países a la comparación? */
export const canAddToComparison = (): boolean =>
  comparisonStore.getState().selectedCodes.length < COMPARISON_MAX;

/** Selector: ¿este país ya está en la comparación? */
export const isInComparison = (cca3: string): boolean =>
  comparisonStore.getState().selectedCodes.includes(cca3);

/**
 * Acción: togglea un país en la lista de comparación.
 * - Si ya está, lo quita.
 * - Si no está y hay espacio (<3), lo añade.
 * - Si no hay espacio, no hace nada (el controller mostrará un toast).
 */
export const toggleComparisonCountry = (cca3: string): void => {
  const { selectedCodes } = comparisonStore.getState();
  const isAlreadyIn = selectedCodes.includes(cca3);

  if (isAlreadyIn) {
    comparisonStore.setState({
      selectedCodes: selectedCodes.filter((code) => code !== cca3),
    });
    notify();
    return;
  }

  if (selectedCodes.length >= COMPARISON_MAX) {
    // Límite alcanzado. El controller decidirá si muestra un toast.
    // El estado NO hace side effects (toasts, alertas). Solo reporta.
    return;
  }

  comparisonStore.setState({
    selectedCodes: [...selectedCodes, cca3],
  });
  notify();
};

/** Acción: vacía la selección de comparación. */
export const clearComparison = (): void => {
  comparisonStore.setState({ selectedCodes: [], isActive: false });
  notify();
};

/** Acción: abre la vista de comparación. */
export const openComparisonView = (): void => {
  const { selectedCodes } = comparisonStore.getState();
  // Solo abrir si hay al menos 2 países para comparar.
  if (selectedCodes.length < 2) return;
  comparisonStore.setState({ isActive: true });
  notify();
};

/** Acción: cierra la vista de comparación sin vaciar la selección. */
export const closeComparisonView = (): void => {
  comparisonStore.setState({ isActive: false });
  notify();
};

export const resetState = (): void => {
  countriesStore.reset();
  filtersStore.reset();
  modalStore.reset();
  comparisonStore.reset();
  filteredCountries = [];
  listeners = [];
};

/**
 * Selecciona un cca3 aleatorio del catálogo cargado.
 *
 * Retorna `string | null`:
 * - `null` cuando el catálogo está vacío (cargando o error).
 *   El caller decide qué hacer (no-op, deshabilitar botón, etc.)
 *
 * Heurística anti-repetición:
 * - Si hay un país abierto en el modal, lo excluye del pool
 *   para que clicks consecutivos no devuelvan el mismo país.
 * - Si solo queda 1 país en el pool (catálogo de 1), lo devuelve igual.
 *
 * Nota: usamos Math.random() porque esto es exploración visual,
 * no seguridad. crypto.getRandomValues sería over-engineering.
 */
export const getRandomCca3 = (): string | null => {
  const { all } = countriesStore.getState();

  // Catálogo vacío → no hay nada que elegir.
  // Devolvemos null (valor) en vez de lanzar excepción (flujo esperado).
  if (all.length === 0) return null;

  // Catálogo con 1 solo país → siempre devuelve ese.
  // No aplicamos el filtro anti-repetición porque el pool quedaría vacío.
  if (all.length === 1) return all[0].cca3;

  // Excluimos el país actualmente abierto (si hay uno).
  // `modalStore.getState().selectedCountry?.cca3` usa optional chaining
  // porque selectedCountry puede ser null (modal cerrado).
  const currentCca3 = modalStore.getState().selectedCountry?.cca3;

  // filter() crea un nuevo array — no mutamos `all`.
  // Inmutabilidad: principio base de nuestro store.
  const pool = all.filter((c) => c.cca3 !== currentCca3);

  // Si el filter vació el pool (imposible con length > 1, pero
  // defensivamente), caemos al catálogo completo.
  const target = pool.length > 0 ? pool : all;

  // Índice aleatorio: Math.floor trunca hacia abajo,
  // Math.random() ∈ [0, 1) → nunca llega a target.length.
  const index = Math.floor(Math.random() * target.length);
  return target[index].cca3;
};

/**
 * Acción: elige un país aleatorio y abre el modal.
 *
 * Separamos selector y acción por responsabilidad:
 * - `getRandomCca3()` → deriva datos (puro, testeable)
 * - `openRandomCountry()` → muta estado (abre el modal)
 *
 * El controller solo llama a esta función. No conoce
 * la lógica de selección ni el pool anti-repetición.
 */
export const openRandomCountry = (): void => {
  const cca3 = getRandomCca3();
  // Si es null (catálogo vacío), simplemente no hacemos nada.
  // El botón puede estar deshabilitado visualmente en el futuro.
  if (cca3) openCountryModal(cca3);
};

// Solo para tests: acceso directo al store para forzar estados
export const __countriesStoreForTest = countriesStore;
