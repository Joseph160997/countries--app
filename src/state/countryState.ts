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

// ========================================================
// 1. ESTADO PRIVADO (Encapsulamiento)
// ========================================================

/** Catálogo original proveniente de la API (Base de datos en RAM) */
let countries: Country[] = [];

/** Lista resultante tras aplicar filtros (Lo que ve el usuario) */
let filteredCountries: Country[] = [];

/** Criterios actuales de filtrado */
let searchQuery = "";
let selectedRegion = "";

/** Lista de suscriptores (componentes que escuchan cambios) */
let listeners: (() => void)[] = [];

/** Interruptor para inicializar favoritos */
let isShowingFavorites: boolean = false;

// ========================================================
// 2. MOTOR DE CÓMPUTO (Filtrado)
// ========================================================

/**
 * Aplica los filtros actuales a la base de datos principal.
 */
const applyFilters = (): void => {
  const query = searchQuery.trim().toLowerCase();

  // Aplicamos el estrechamiento de datos (Narrowing) mediante filtros [2]
  filteredCountries = countries.filter((country) => {
    // 1. Filtro de búsqueda (Basado en el nombre) [2]
    const matchesSearch = country.name.toLowerCase().includes(query);

    // 2. Filtro de región (Usa el tipo Region que definimos) [2, 3]
    // Aunque ahora sea un tipo específico, comparar contra "" sigue siendo válido.
    const matchesRegion =
      selectedRegion === "" || country.region === selectedRegion;

    // 3. Filtro de favoritos (La nueva pieza clave)
    // Si isShowingFavorites es false, deja pasar a todos.
    // Si es true, solo deja pasar a los que tienen isFavorite: true.
    const matchesFavorites = !isShowingFavorites || country.isFavorite;

    // El país solo se muestra si cumple las TRES condiciones a la vez [2]
    return matchesSearch && matchesRegion && matchesFavorites;
  });

  // ¡IMPORTANTE! Notificamos a la UI para que se redibuje [2, 4]
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
  isShowingFavorites = !isShowingFavorites;
  applyFilters(); // Re-calculamos la vitrina con el nuevo filtro
};
