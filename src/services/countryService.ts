import type { Country, RestCountryAPIResponse } from "../types/Country";
import { mapCountry, isRestCountryResponse } from "../mappers/CountryMapper";
import { httpClient } from "../utils/http";
import { storage } from "../utils/db";

const BASE_URL = import.meta.env.VITE_API_COUNTRIES_BASE_URL;

/**
 * Obtiene países con estrategia "Network First": Intenta API, si falla busca en Storage.
 * @param favoriteCodes - Array de códigos (cca3) guardados en LocalStorage.
 * @return Promise<Country[]> - Lista de países formateados para la UI, ya sea desde la red o desde el almacenamiento local.
 * Implementa validación manual de la respuesta de la API y persistencia en IndexedDB para uso offline.
 */
export const getAllCountries = async (
  favoriteCodes: string[],
): Promise<Country[]> => {
  if (!BASE_URL) throw new Error("VITE_API_COUNTRIES_BASE_URL no definida.");
  try {
    // 1. Uso de httpClient: Reemplaza fetch, añade timeout y validación automática
    const url = `${BASE_URL}/all?fields=name,flags,population,region,capital,cca3`;
    console.log("URL FINAL:", url);
    const rawData = await httpClient<RestCountryAPIResponse[]>(url, {
      method: "GET",
      validator: isRestCountryResponse, // Validación en tiempo de ejecución (Narrowing)
    });
    console.log("aqui dentro ahy", rawData);
    // 2. Mapeo síncrono a la interfaz de la UI
    const mappedCountries = rawData.map((raw) =>
      mapCountry(raw, favoriteCodes),
    );

    // 3. Persistencia en IndexedDB: Guardamos los datos frescos para uso offline
    // Usamos el almacenamiento genérico que definimos anteriormente
    storage.saveAll<Country>("countries", mappedCountries).catch(console.error);

    return mappedCountries;
  } catch (error) {
    console.error("ERROR COMPLETO", error);

    // 4. Estrategia de Respaldo (Fallback): Si la red falla, consultamos el Storage local
    const cachedCountries = (await storage.get<Country>(
      "countries",
    )) as Country[];

    if (cachedCountries.length > 0) {
      // Si hay datos locales, los devolvemos (aunque podrían estar desactualizados)
      return cachedCountries;
    }

    // Si no hay nada en caché, relanzamos el error crítico
    throw new Error(
      "No se pudo obtener datos ni de la red ni del almacenamiento local.",
    );
  }
};
