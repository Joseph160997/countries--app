import type { Country } from "../types/Country";
import type { RestCountriesResponse } from "../types/RestCountryDTO";
import { mapToCountry, unwrapResponse } from "../mappers/CountryMapper";
import { isRestCountriesResponse } from "../validators/restCountriesValidator";
import { httpClient } from "../utils/http";
import { storage } from "../utils/db";

const API_KEY = import.meta.env.VITE_COUNTRIES_API_KEY;
const BASE_URL = "https://api.restcountries.com/v5";

// Campos mínimos requeridos por el mapper para mantener la respuesta pequeña [1, 3]
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
 * Obtiene países de la API en "chunks" predecibles usando paginación [4].
 */
export const getAllCountries = async (
  favoriteCodes: string[],
  limit: number = 20, // Por defecto 20 países por página
  offset: number = 0, // Empieza desde el primer registro
): Promise<Country[]> => {
  if (!BASE_URL) throw new Error("La URL de la API no fue proporcionada.");

  try {
    // Stackeamos filtros: campos específicos + límite + desplazamiento [2, 4]
    const url = `${BASE_URL}/all?response_fields=${REQUIRED_FIELDS}&limit=${limit}&offset=${offset}`;

    const rawResponse = await httpClient<RestCountriesResponse>(url, {
      ...options,
      validator: isRestCountriesResponse,
    });

    const dtos = unwrapResponse(rawResponse);
    const countries = dtos.map((dto) => mapToCountry(dto, favoriteCodes));

    // Guardado offline en segundo plano (non-blocking)
    storage.saveAll<Country>("countries", countries).catch(console.error);

    return countries;
  } catch (error) {
    console.error("[getAllCountries] Fallo de red:", error);

    try {
      const cached = await storage.get<Country>("countries");
      const cachedCountries = Array.isArray(cached) ? cached : [cached];
      if (cachedCountries.length > 0) return cachedCountries;
    } catch (dbError) {
      console.error("[getAllCountries] Fallo de caché:", dbError);
    }

    throw new Error("Error: No hay conexión ni datos locales disponibles.");
  }
};
