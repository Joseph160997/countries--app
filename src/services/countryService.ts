import type { Country } from "../types/Country";
import type { RestCountriesResponse } from "../types/RestCountryDTO";

import { mapToCountry, unwrapResponse } from "../mappers/CountryMapper";

import { isRestCountriesResponse } from "../validators/restCountriesValidator";

import { httpClient } from "../utils/http";
import { storage } from "../utils/db";

const API_KEY = import.meta.env.VITE_COUNTRIES_API_KEY;
const BASE_URL = "https://api.restcountries.com/v5";

// Define los campos que tu mapper requiere
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
 * Obtiene los datos de los paísesses de la API.
 * @param favoriteCodes
 * @returns
 */
export const getAllCountries = async (
  favoriteCodes: string[],
): Promise<Country[]> => {
  if (!BASE_URL) {
    throw new Error("La URL de la API no fue proporcionada.");
  }

  try {
    const url = `${BASE_URL}/all?fields=${REQUIRED_FIELDS}`;
    const rawResponse = await httpClient<RestCountriesResponse>(url, {
      ...options,
      validator: isRestCountriesResponse,
    });

    // RestCountriesResponse -> RestCountryDTO[]
    const dtos = unwrapResponse(rawResponse);

    // RestCountryDTO[] -> Country[]
    const countries = dtos.map((dto) => mapToCountry(dto, favoriteCodes));

    // Persistencia offline
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

    throw new Error(
      "No se pudo obtener información ni de la red ni del almacenamiento local.",
    );
  }
};
