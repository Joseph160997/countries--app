import type { Country, Region } from "@/domain/country";
import type { CountryRepository } from "@/domain/ports/country.repository";
import { isErr } from "@/shared/result";
import { toggleFavoritePersistence } from "@/presentation/services/favoriteService";
import { storageService } from "@/infrastructure/persistence/localStorage.store";
import { createCountriesSlice, PAGE_SIZE } from "../slices/countries.slice";
import { createFiltersSlice, type SortCriteria } from "../slices/filters.slice";
import {
  computeFilteredCountries,
  buildHeroSlides,
  type HeroSlide,
} from "../slices/explorer.selectors";

const SORT_KEY = "World_Explorer_Sort";

/**
 * Dependencias del estado de catálogo.
 * `notify` lo inyecta la fachada: cada slice notifica al mismo bus,
 * y el renderer decide qué repintar.
 */
export interface CatalogDeps {
  readonly notify: () => void;
}

/**
 * Estado de catálogo: países cargados, filtros, orden y paginación.
 *
 * Factory con dependencias explícitas: no hay singletons mutables,
 * el ownership del estado vive dentro del closure.
 */
export const createCatalogState = ({ notify }: CatalogDeps) => {
  let countryRepository: CountryRepository | null = null;

  const countriesStore = createCountriesSlice();
  const filtersStore = createFiltersSlice();

  /** Caché del resultado derivado — se recalcula en cada cambio relevante. */
  let filteredCountries: Country[] = [];

  // ─── Motor de derivación (delega en el selector puro) ───
  const applyFilters = (): void => {
    filteredCountries = computeFilteredCountries(
      countriesStore.getState().all,
      filtersStore.getState(),
    );
    // Reset de la ventana de paginación cuando cambian los filtros
    countriesStore.setState({ currentPage: 1 });
    notify();
  };

  // ─── Inicialización de dependencias ───
  const initCountryState = (repository: CountryRepository): void => {
    countryRepository = repository;
  };

  const initSort = (): void => {
    const savedSort = storageService.get<SortCriteria>(SORT_KEY);
    if (savedSort) filtersStore.setState({ sort: savedSort });
  };

  // ─── Selectores ───

  /** Slides del hero: País del Día + destacados curados. */
  const getHeroSlides = (): HeroSlide[] =>
    buildHeroSlides(countriesStore.getState().all);

  /** Catálogo completo de países (sin filtros del grid). */
  const getAllCountries = (): readonly Country[] =>
    countriesStore.getState().all;

  const findCountry = (cca3: string): Country | undefined =>
    countriesStore.getState().all.find((c) => c.cca3 === cca3);

  const getIsLoading = (): boolean => countriesStore.getState().isLoading;

  const getCountries = (): Country[] => {
    const { currentPage } = countriesStore.getState();
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCountries.slice(start, start + PAGE_SIZE);
  };

  const getCurrentPage = (): number => countriesStore.getState().currentPage;

  const getTotalPages = (): number => {
    if (filteredCountries.length === 0) return 1;
    return Math.ceil(filteredCountries.length / PAGE_SIZE);
  };

  const getFilteredTotal = (): number => filteredCountries.length;

  const getAllCountriesCount = (): number =>
    countriesStore.getState().all.length;

  const isShowingFavoritesActive = (): boolean =>
    filtersStore.getState().showFavorites;

  const getSort = (): SortCriteria => filtersStore.getState().sort;

  const getBorderNames = (codes: string[]): string[] =>
    codes.map((code) => {
      const found = findCountry(code);
      return found ? found.name : code;
    });

  // ─── Acciones ───

  const setPage = (page: number): void => {
    const clamped = Math.max(1, Math.min(page, getTotalPages()));
    countriesStore.setState({ currentPage: clamped });
    notify();
  };

  const loadCountries = async (favoriteCodes: string[]): Promise<void> => {
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

  const setSearchQuery = (text: string): void => {
    filtersStore.setState({ query: text });
    applyFilters();
  };

  const setRegionFilter = (region: Region): void => {
    filtersStore.setState({ region });
    applyFilters();
  };

  const toggleCountryFavorite = (cca3: string): void => {
    const nowIsFavorite = toggleFavoritePersistence(cca3);
    const { all } = countriesStore.getState();
    countriesStore.setState({
      all: all.map((c) =>
        c.cca3 === cca3 ? { ...c, isFavorite: nowIsFavorite } : c,
      ),
    });
    applyFilters();
  };

  const toggleShowFavorites = (): void => {
    const { showFavorites } = filtersStore.getState();
    filtersStore.setState({ showFavorites: !showFavorites });
    applyFilters();
  };

  const setSort = (criteria: SortCriteria): void => {
    filtersStore.setState({ sort: criteria });
    storageService.save(SORT_KEY, criteria);
    applyFilters();
  };

  const reset = (): void => {
    countriesStore.reset();
    filtersStore.reset();
    filteredCountries = [];
  };

  return {
    store: countriesStore,
    initCountryState,
    initSort,
    getHeroSlides,
    getAllCountries,
    findCountry,
    getIsLoading,
    getCountries,
    getCurrentPage,
    getTotalPages,
    getFilteredTotal,
    getAllCountriesCount,
    isShowingFavoritesActive,
    getSort,
    getBorderNames,
    setPage,
    loadCountries,
    setSearchQuery,
    setRegionFilter,
    toggleCountryFavorite,
    toggleShowFavorites,
    setSort,
    reset,
  };
};

export type CatalogState = ReturnType<typeof createCatalogState>;
