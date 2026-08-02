import type { Country, Region } from "@/domain/country";
import { getAllCountries } from "@/infrastructure/api/restCountries/country.client";
import { toggleFavoritePersistence } from "@/presentation/services/favoriteService";
import { storageService } from "@/infrastructure/persistence/localStorage.store";

// ========================================================
// 1. ESTADO PRIVADO
// ========================================================

let isLoading: boolean = false;
let countries: Country[] = [];
let filteredCountries: Country[] = [];
let searchQuery = "";
let selectedRegion = "";
let listeners: (() => void)[] = [];
let isShowingFavorites: boolean = false;
let minPopulation: number = 0;

type SortCriteria = "none" | "population-desc" | "name-asc";
let currentSort: SortCriteria = "none";
let selectedCountry: Country | null = null;

// Cuántos países mostramos en el DOM en este momento
let visibleCount: number = 20;

const SORT_KEY = "World_Explorer_Sort";

// ========================================================
// 2. MOTOR DE CÓMPUTO
// ========================================================

/**
 * Aplica los filtros de búsqueda y ordenamiento.
 */
const applyFilters = (): void => {
  const query = searchQuery.trim().toLowerCase();

  let result = countries.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(query);
    const matchesRegion =
      selectedRegion === "" || country.region === selectedRegion;
    const matchesFavorites = !isShowingFavorites || country.isFavorite;
    const matchesPopulation =
      minPopulation === 0 || country.population >= minPopulation;
    return (
      matchesSearch && matchesRegion && matchesFavorites && matchesPopulation
    );
  });

  if (currentSort !== "none") {
    result.sort((a, b) => {
      if (currentSort === "population-desc") return b.population - a.population;
      if (currentSort === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });
  }

  filteredCountries = result;

  // 🆕 Cuando cambian los filtros, reseteamos la ventana visible
  // para que el usuario empiece desde el principio del nuevo resultado
  visibleCount = 20;

  notify();
};

// ========================================================
// 3. REACTIVIDAD
// ========================================================

/**
 * Notifica a los observadores que el estado ha cambiado.
 */
const notify = (): void => {
  listeners.forEach((listener) => listener());
};

/**
 *   Suscribe a cambios en el estado.
 */
export const subscribe = (callback: () => void): (() => void) => {
  listeners.push(callback);
  if (filteredCountries.length > 0) callback();
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

// ========================================================
// 4. SELECTORES
// ========================================================

/** Devuelve el estado de carga */
export const getIsLoading = (): boolean => isLoading;

/**
 * Devuelve solo el slice visible del resultado filtrado.
 * El DOM nunca renderiza más de `visibleCount` tarjetas.
 */
export const getCountries = (): Country[] => {
  return filteredCountries.slice(0, visibleCount);
};

/**
 * Indica si hay más países disponibles tras el slice visible.
 * La UI usa esto para mostrar u ocultar el botón "Load more".
 */
export const hasMore = (): boolean => {
  return visibleCount < filteredCountries.length;
};

/**
 *  Total de resultados filtrados (para mostrar "Mostrando X de Y").
 */
export const getFilteredTotal = (): number => {
  return filteredCountries.length;
};

export const getSelectedCountry = (): Country | null => selectedCountry;
export const isShowingFavoritesActive = (): boolean => isShowingFavorites;
export const getSort = (): SortCriteria => currentSort;

// ========================================================
// 5. ACCIONES
// ========================================================

export const loadCountries = async (favoriteCodes: string[]): Promise<void> => {
  isLoading = true; // modificamos el estado de carga
  notify(); // 🔔 Notifica para que renderUI muestre los skeletons

  try {
    countries = await getAllCountries(favoriteCodes);
    applyFilters(); // applyFilters llama notify() internamente
  } catch (error) {
    console.error("[Estado] Error en la carga coordinada:", error);
  } finally {
    isLoading = false;
    notify(); // 🔔 Notifica para que renderUI muestre las tarjetas reales
  }
};

/**
 * 🆕 Amplía la ventana visible en 20 países más.
 * No hace ningún request — todo está en RAM.
 */
export const loadMore = (): void => {
  visibleCount = Math.min(visibleCount + 20, filteredCountries.length);
  notify();
};

export const setSearchQuery = (text: string): void => {
  searchQuery = text;
  applyFilters();
};

export const setRegionFilter = (region: Region): void => {
  selectedRegion = region;
  applyFilters();
};

export const toggleCountryFavorite = (cca3: string): void => {
  const nowIsFavorite = toggleFavoritePersistence(cca3);
  countries = countries.map((c) =>
    c.cca3 === cca3 ? { ...c, isFavorite: nowIsFavorite } : c,
  );
  applyFilters();
};

export const toggleShowFavorites = (): void => {
  isShowingFavorites = !isShowingFavorites;
  applyFilters();
};

//** Aplica un nuevo criterio de ordenamiento */
export const setSort = (criteria: SortCriteria): void => {
  currentSort = criteria;
  storageService.save(SORT_KEY, criteria);
  applyFilters();
};

/** Recupera el criterio de ordenamiento guardado */
export const initSort = (): void => {
  const savedSort = storageService.get<SortCriteria>(SORT_KEY);
  if (savedSort) currentSort = savedSort;
};

export const openCountryModal = (cca3: string): void => {
  // Buscamos en `countries` completo, no en el slice visible
  // así funciona aunque el país no esté renderizado en pantalla
  const country = countries.find((c) => c.cca3 === cca3);
  if (country) {
    selectedCountry = country;
    notify();
  }
};

export const closeCountryModal = (): void => {
  selectedCountry = null;
  notify();
};

export const getBorderNames = (codes: string[]): string[] => {
  return codes.map((code) => {
    const found = countries.find((c) => c.cca3 === code);
    return found ? found.name : code;
  });
};

export const resetState = (): void => {
  countries = [];
  filteredCountries = [];
  searchQuery = "";
  selectedRegion = "";
  isShowingFavorites = false;
  minPopulation = 0;
  currentSort = "none";
  selectedCountry = null;
  visibleCount = 20;
  listeners = [];
};
