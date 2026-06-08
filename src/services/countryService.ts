import type { Country, RestCountryAPIResponse } from "../types/Country";
import { mapCountry } from "../mappers/CountryMapper";

// URL Base de la API (Ej: https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3)
const BASE_URL = import.meta.env.VITE_API_COUNTRIES_BASE_URL;
const options = { method: "GET" };

/**
 * Obtiene todos los países de la API y los retorna mapeados con su estado de favoritos.
 * @param favoriteCodes - Array de IDs de favoritos para calcular el estado inicial.
 * @returns Promise<Country[]> - Una promesa que se resuelve con un arreglo de países mapeados de forma síncrona.
 */
export const getAllCountries = async (
  favoriteCodes: string[],
): Promise<Country[]> => {
  if (!BASE_URL) {
    throw new Error(
      "Error de configuración: VITE_API_COUNTRIES_BASE_URL no está definida.",
    );
  }

  try {
    const response = await fetch(BASE_URL, options);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    // Tipamos la respuesta cruda directamente aquí
    const data = (await response.json()) as RestCountryAPIResponse[];

    // Validación defensiva del tipo de dato de entrada
    if (!Array.isArray(data)) {
      throw new Error("La API no retornó una colección (Array) esperada.");
    }

    // 🚀 OPTIMIZACIÓN: Mapeo síncrono instantáneo en memoria lineal O(n)
    return data.map((rawCountry: RestCountryAPIResponse) =>
      mapCountry(rawCountry, favoriteCodes),
    );
  } catch (error) {
    console.error("Fallo crítico en el servicio getAllCountries:", error);
    throw error; // Re-lanzamos el error para que la UI lo gestione con un estado visual de error
  }
};
