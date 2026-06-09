/**
 * GESTOR DE ESTADO CENTRALIZADO (Store)
 *
 * Este módulo actúa como la "fuente única de verdad" para los países.
 * Implementa el Patrón Observador para notificar a la UI y técnicas de
 * inmutabilidad para proteger los datos [3, 4].
 */
import type { Country } from "../types/Country";
import { getAllCountries } from "../services/countryService";

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

// ========================================================
// 2. MOTOR DE CÓMPUTO (Filtrado)
// ========================================================

/**
 * Procesa la lista maestra basándose en los filtros actuales.
 * Sigue un flujo unidireccional: Datos -> Filtro -> Notificación.
 */
const applyFilters = (): void => {
  const query = searchQuery.trim().toLowerCase();

  // Aplicamos el estrechamiento de datos (Narrowing) mediante filtros [5]
  filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(query);
    const matchesRegion =
      selectedRegion === "" || country.region === selectedRegion;

    // Solo sobrevive si cumple ambas condiciones
    return matchesSearch && matchesRegion;
  });

  // Notificamos a la UI que hay nuevos datos para mostrar
  notify();
};

// ========================================================
// 3. SISTEMA DE REACTIVIDAD (Observer)
// ========================================================

/** Ejecuta todas las funciones suscritas cuando el estado cambia [6] */
const notify = (): void => {
  listeners.forEach((listener) => listener());
};

/**
 * Conecta un componente al estado.
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
export const getCountries = (): Country[] => {
  return [...filteredCountries];
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
export const setRegionFilter = (region: string): void => {
  selectedRegion = region;
  applyFilters();
};
