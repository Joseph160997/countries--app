import type { Country } from "../types/Country";
import type {
  RestCountriesResponse,
  RestCountryDTO,
} from "../types/RestCountryDTO";
import { mapToCountry, unwrapResponse } from "../mappers/CountryMapper";
import { isRestCountriesResponse } from "../validators/restCountriesValidator";
import { httpClient } from "../utils/http";
import { storage } from "../utils/db";
import { storageService } from "../utils/localStorage";

// Esta constante define cuánto tiempo es válido el caché — 24 horas en milisegundos
const CACHE_KEY = "countries_last_fetch";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

const API_KEY = import.meta.env.VITE_COUNTRIES_API_KEY;
const BASE_URL = "https://api.restcountries.com/countries/v5";

const REQUIRED_FIELDS = [
  "codes",
  "names",
  "flag",
  "population",
  "region",
  "capitals",
  "subregion",
  "borders",
  "languages",
  "currencies",
  "tlds",
].join(",");

const options = {
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

/**
 * Obtiene todos los países desde la API o desde el caché local.
 * @param favoriteCodes
 * @returns Lista de países con información básica y estado de favorito
 * @throws Error si no hay conexión ni datos locales disponibles
 * @remarks
 * - Estrategia: Cache-first. Primero intenta servir desde IndexedDB si el caché es válido.
 * - Si el caché es inválido o no existe, hace fetch a la API y actualiza el caché.
 * - Si la red falla y hay caché expirado, sirve el caché expirado como último recurso.
 * - Los favoritos se aplican sobre los datos obtenidos, ya sea del caché o de la red.
 * - El caché se considera válido si tiene menos de 24 horas.
 * - La API limita la cantidad de resultados por request a 250, por lo que se hace paginación.
 */
export const getAllCountries = async (
  favoriteCodes: string[],
): Promise<Country[]> => {
  // ============================================
  // ESTRATEGIA: Cache-first
  // Antes de tocar la red, preguntamos si tenemos
  // datos frescos en local
  // ============================================
  if (isCacheValid()) {
    try {
      const cached = await storage.get<Country>("countries");
      const cachedCountries = Array.isArray(cached) ? cached : [cached];

      if (cachedCountries.length > 0) {
        console.log(
          `[Cache] ✅ Sirviendo ${cachedCountries.length} países desde IndexedDB`,
        );

        // re-aplicamos los favoritos actuales sobre el caché
        // porque pueden haber cambiado desde la última vez
        return cachedCountries.map((c) => ({
          ...c,
          isFavorite: favoriteCodes.includes(c.cca3),
        }));
      }
    } catch (dbError) {
      // Si IndexedDB falla, ignoramos y vamos a la red
      console.warn("[Cache] IndexedDB falló, yendo a la red:", dbError);
    }
  }

  // ============================================
  // Si el caché no es válido o falló — vamos a la red
  // ============================================
  console.log("[Network] Iniciando fetch desde la API...");

  try {
    const LIMIT = 100;
    let offset = 0;
    let hasMore = true; // La API indica si hay más resultados en meta.more
    const allDtos: RestCountryDTO[] = [];

    while (hasMore) {
      const url = `${BASE_URL}?response_fields=${REQUIRED_FIELDS}&limit=${LIMIT}&offset=${offset}`;
      console.log(`[Network] Fetching offset=${offset}...`);

      const rawResponse = await httpClient<RestCountriesResponse>(url, {
        ...options,
        validator: isRestCountriesResponse,
      });

      const dtos = unwrapResponse(rawResponse);
      allDtos.push(...dtos);

      hasMore = rawResponse.data.meta.more;
      offset += LIMIT;

      console.log(
        `[Network] Acumulados: ${allDtos.length} / ${rawResponse.data.meta.total}`,
      );
    }

    // Mapeamos los DTOs a nuestro modelo de Country
    const countries = allDtos.map((dto) => mapToCountry(dto, favoriteCodes));
    console.log(`[Network] ✅ ${countries.length} países cargados`);

    // Guardamos en IndexedDB y actualizamos el timestamp
    storage.saveAll<Country>("countries", countries).catch(console.error);
    storageService.save(CACHE_KEY, Date.now());

    return countries;
  } catch (error) {
    console.error("[Network] ❌ Fallo de red:", error);

    // Último recurso: caché expirado pero es lo único que tenemos
    try {
      const cached = await storage.get<Country>("countries");
      const cachedCountries = Array.isArray(cached) ? cached : [cached];

      if (cachedCountries.length > 0) {
        console.warn(
          `[Cache] ⚠️ Sirviendo caché expirado (${cachedCountries.length} países)`,
        );
        return cachedCountries.map((c) => ({
          ...c,
          isFavorite: favoriteCodes.includes(c.cca3),
        }));
      }
    } catch (dbError) {
      console.error("[Cache] ❌ IndexedDB también falló:", dbError);
    }

    throw new Error("No hay conexión ni datos locales disponibles.");
  }
};

/**
 * Comprueba si el caché de IndexedDB sigue siendo válido.
 * Devuelve true si los datos tienen menos de 24h.
 */
function isCacheValid(): boolean {
  const lastFetch = storageService.get<number>(CACHE_KEY);

  // Si nunca hemos hecho fetch, no hay caché
  if (!lastFetch) {
    console.log("[Cache] Sin timestamp — caché inválido");
    return false;
  }

  const age = Date.now() - lastFetch;
  const ageInMinutes = Math.round(age / 1000 / 60);
  const isValid = age < CACHE_TTL;

  console.log(
    `[Cache] Edad del caché: ${ageInMinutes} minutos — ${isValid ? "✅ válido" : "❌ expirado"}`,
  );

  return isValid;
}
