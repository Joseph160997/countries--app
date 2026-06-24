import type { Country } from "../types/Country";
import type {
  RestCountriesResponse,
  RestCountryDTO,
} from "../types/RestCountryDTO";
import { mapToCountry, unwrapResponse } from "../mappers/CountryMapper";
import { isRestCountriesResponse } from "../validators/restCountriesValidator";
import { httpClient } from "../utils/http";
import { storage } from "../utils/db";

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

export const getAllCountries = async (
  favoriteCodes: string[],
): Promise<Country[]> => {
  console.log("[getAllCountries] Iniciando carga completa...");

  try {
    const LIMIT = 100; // Máximo del plan gratuito
    let offset = 0; // Paginación
    let hasMore = true;
    const allDtos: RestCountryDTO[] = [];

    // Paginación interna hasta agotar todos los países
    while (hasMore) {
      const url = `${BASE_URL}?response_fields=${REQUIRED_FIELDS}&limit=${LIMIT}&offset=${offset}`;
      console.log(`[getAllCountries] Fetching offset=${offset}...`);

      const rawResponse = await httpClient<RestCountriesResponse>(url, {
        ...options,
        validator: isRestCountriesResponse,
      });

      const dtos = unwrapResponse(rawResponse);
      allDtos.push(...dtos);

      // La propia API nos dice si hay más páginas
      hasMore = rawResponse.data.meta.more;
      offset += LIMIT;

      console.log(
        `[getAllCountries] Acumulados: ${allDtos.length} / ${rawResponse.data.meta.total}`,
      );
    }

    const countries = allDtos.map((dto) => mapToCountry(dto, favoriteCodes));
    console.log(
      `[getAllCountries] ✅ ${countries.length} países cargados en total`,
    );

    // Guardamos TODO en IndexedDB para offline
    storage.saveAll<Country>("countries", countries).catch(console.error);

    return countries;
  } catch (error) {
    console.error("[getAllCountries] ❌ Fallo de red:", error);

    try {
      const cached = await storage.get<Country>("countries");
      const cachedCountries = Array.isArray(cached) ? cached : [cached];
      if (cachedCountries.length > 0) {
        console.log(
          `[getAllCountries] 📦 Sirviendo ${cachedCountries.length} países desde caché`,
        );
        return cachedCountries;
      }
    } catch (dbError) {
      console.error("[getAllCountries] ❌ Fallo de caché:", dbError);
    }

    throw new Error("No hay conexión ni datos locales disponibles.");
  }
};
