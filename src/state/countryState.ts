/**
 * GESTOR DE ESTADO CENTRALIZADO (Store)
 *
 * Este módulo actúa como la "fuente única de verdad" para los países.
 * Implementa el Patrón Observador para notificar a la UI y técnicas de
 * inmutabilidad para proteger los datos [3, 4].
 */
import type { Country, Region } from "../types/Country";
import { getAllCountries } from "../services/countryService";
import { toggleFavoritePersistence } from "../services/favoriteService";
import { storageService } from "../utils/localStorage";

// ========================================================
// 1. ESTADO PRIVADO (Encapsulamiento)
// ========================================================

/** Catálogo original proveniente de la API (Base de datos en RAM) */
let countries: Country[] = [];

/** Lista resultante tras aplicar filtros (Lo que ve el usuario) */
let filteredCountries: Country[] = [];

/** Criterios actuales de filtrado */
let searchQuery = "";
/**
 */
let selectedRegion = "";

/** Lista de suscriptores (componentes que escuchan cambios) */
let listeners: (() => void)[] = [];

/** Interruptor para inicializar favoritos */
let isShowingFavorites: boolean = false;

//** Definimos el rango de población */
let minPopulation: number = 0;

// Definimos los tipos de orden posibles
type SortCriteria = "none" | "population-desc" | "name-asc";
let currentSort: SortCriteria = "none";

/* Definimos el paquete de datos seleccionado para el modal */
let selectedCountry: Country | null = null;

// Definimos la clave para almacenar el criterio de ordenamiento
const SORT_KEY = "World_Explorer_Sort";

// ========================================================
// 2. MOTOR DE CÓMPUTO (Filtrado)
// ========================================================

/**
 * Aplica los filtros actuales a la base de datos principal.
 */
const applyFilters = (): void => {
  const query = searchQuery.trim().toLowerCase();

  // 1. FILTRADO: Creamos el subconjunto de datos [1]
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

  // 2. ORDENAMIENTO: Se ejecuta UNA SOLA VEZ fuera del bucle
  if (currentSort !== "none") {
    result.sort((a, b) => {
      if (currentSort === "population-desc") {
        return b.population - a.population; // Orden descendente
      }
      if (currentSort === "name-asc") {
        // localeCompare es el estándar para comparar textos con acentos/eñes [2]
        return a.name.localeCompare(b.name);
      }
      return 0; // Caso por defecto
    });
  }

  // 3. ASIGNACIÓN FINAL [3]
  filteredCountries = result;

  // 4. NOTIFICACIÓN: Disparamos la reactividad para la UI [4]
  notify();
};

// ========================================================
// 3. SISTEMA DE REACTIVIDAD (Observer)
// ========================================================

/**
 * Notifica a todos los componentes suscriptos de cambios en el estado.
 */
const notify = (): void => {
  listeners.forEach((listener) => listener());
};

/**
 * Permite a los componentes suscribirse a cambios en el estado.
 * @param callback - Función que el componente usará para re-renderizarse.
 * @returns Función de desuscripción para liberar memoria.
 */
export const subscribe = (callback: () => void): (() => void) => {
  listeners.push(callback);

  // Si ya tenemos datos, sincronizamos al nuevo suscriptor de inmediato
  if (filteredCountries.length > 0) {
    callback();
  }

  // Retornamos el "limpiador" para evitar Memory Leaks [7]
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

// ========================================================
// 4. ACCIONES PÚBLICAS Y SELECTORES
// ========================================================

/**
 * SELECTOR: Entrega los países filtrados.
 * Usa el operador spread [...] para asegurar inmutabilidad [8].
 */
export const getCountries = (limit?: number): Country[] => {
  const countries = [...filteredCountries];
  return limit !== undefined ? countries.slice(0, limit) : countries;
};

/**
 * ACCIÓN: Carga inicial de datos.
 * Es una función asíncrona que coordina la red y el almacenamiento [3].
 */
export const loadCountries = async (favoriteCodes: string[]): Promise<void> => {
  try {
    // Obtenemos los datos del servicio (que usa httpClient e IndexedDB)
    countries = await getAllCountries(favoriteCodes);

    // Inicializamos la vista filtrada
    applyFilters();
  } catch (error) {
    console.error("[Estado] Error en la carga coordinada:", error);
  }
};

/**
 * ACCIÓN: Actualiza el texto de búsqueda.
 */
export const setSearchQuery = (text: string): void => {
  searchQuery = text;
  applyFilters();
};

/**
 * ACCIÓN: Actualiza la región seleccionada.
 */
export const setRegionFilter = (region: Region): void => {
  selectedRegion = region;
  applyFilters();
};

/**
 *  ACCIÓN: Cambia el estado de favorito de un país.
 * @param cca3 - Código (cca3) del país.
 */
export const toggleCountryFavorite = (cca3: string): void => {
  const nowIsFavorite = toggleFavoritePersistence(cca3);

  // 1. Mutación inmutable de la base de datos principal
  countries = countries.map((c) =>
    c.cca3 === cca3 ? { ...c, isFavorite: nowIsFavorite } : c,
  );

  // 2. Disparamos la reactividad (esto llama a notify() internamente)
  applyFilters();
};

/**
 * ACCIÓN: Activa o desactiva el modo de vista "Solo Favoritos".
 */
export const toggleShowFavorites = (): void => {
  isShowingFavorites = !isShowingFavorites; // Cambiamos el estado del interruptor Ahora es true
  applyFilters(); // Re-calculamos la vitrina con el nuevo filtro
};

/**
 * SELECTOR: Devuelve el estado actual del interruptor de favoritos.
 */
export const isShowingFavoritesActive = (): boolean => {
  return isShowingFavorites;
};

/**
 * ACCIÓN: Cambia el criterio de ordenamiento.
 */
export const setSort = (criteria: SortCriteria) => {
  currentSort = criteria;

  // Guardamos el criterio de ordenaniebto en el almacenammiento storageServices
  storageService.save(SORT_KEY, criteria);

  applyFilters();
};

/**
 * ACCIÓN: Inicializa el criterio de ordenamiento.
 */
export const initSort = (): void => {
  // 1. Leemos el valor guardado [7, 8]
  const savedSort = storageService.get<SortCriteria>(SORT_KEY);

  // 2. Si existe, lo aplicamos al estado interno
  if (savedSort) {
    currentSort = savedSort;
    // applyFilters() se llamará después en el loadCountries
  }
};

/**
 * SELECTOR: Devuelve el criterio de ordenamiento actual.
 * @returns Criterio de ordenamiento actual.
 */
export const getSort = (): SortCriteria => currentSort;

/**
 * ACCIÓN: Abre el modal con los detalles completos de un país (usa /alpha para bordes).
 * @param cca3 - Código (cca3) del país.
 */
export const openCountryModal = (cca3: string): void => {
  const country = countries.find((c) => c.cca3 === cca3);
  if (country) {
    selectedCountry = country; // Ya tiene sus .borders
    notify();
  }
};

/**
 * ACCIÓN: Cierra el modal con los detalles de un país.
 */
export const closeCountryModal = (): void => {
  selectedCountry = null;
  notify();
};

/**
 * SELECTOR: Devuelve el paquete de datos seleccionado para el modal.
 * @returns Paquete de datos seleccionado para el modal.
 */
export const getSelectedCountry = (): Country | null => selectedCountry;

/**
 * SELECTOR: Entrega la totalidad de los países cargados en memoria.
 * Se usa para buscar datos de referencia como los nombres de las fronteras.
 */
const getFullCountryList = (): Country[] => {
  return [...countries]; // Retornamos la copia del catálogo original [1, 2]
};

/**
 * Traduce una lista de codigos de países a nombres de países.
 * @param codes - Lista de códigos de países.
 * @returns Lista de nombres de países. ej: ['Colombia', 'Perú', 'Argentina']
 */
export const getBorderNames = (codes: string[]): string[] => {
  const allCountries = getFullCountryList(); // Obtiene la copia del catálogo [2]

  return codes.map((code) => {
    const found = allCountries.find((c) => c.cca3 === code);
    // IMPORTANTE: Retornar el nombre si se encuentra, o el código como respaldo
    return found ? found.name : code;
  });
};

/**
 * ACCIÓN: De uso solo para testeo
 */
export const resetState = () => {
  countries = [];
  filteredCountries = [];
  searchQuery = "";
  selectedRegion = "";
  isShowingFavorites = false;
  minPopulation = 0;
  currentSort = "none";
  selectedCountry = null;
  listeners = [];
};
