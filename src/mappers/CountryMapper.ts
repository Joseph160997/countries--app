import type { Country, Region, RestCountryAPIResponse } from "../types/Country";

/**
 * Transforma un objeto crudo de la API de países en un objeto estructurado para la UI.
 * @param country - Objeto crudo que cumple con la interfaz de la API.
 * @param favoriteCodes - Array de códigos (cca3) guardados en LocalStorage.
 */
export const mapCountry = (
  country: RestCountryAPIResponse,
  favoriteCodes: string[],
): Country => {
  return {
    name: country.name.common,
    // Usamos SVG para mantener la resolución escalable en pantallas de alta densidad
    flag: country.flags.svg || country.flags.png,
    population: country.population,
    region: (country.region as Region) || "",
    // Evaluación de cortocircuito (Short-circuit evaluation) para campos opcionales
    capital: country.capital?.[0] || "No Capital",
    cca3: country.cca3,
    borders: country.borders || [],
    // Verificación posicional indexada de alta velocidad
    isFavorite: favoriteCodes.includes(country.cca3),
  };
};

export const isRestCountryResponse = (
  data: unknown,
): data is RestCountryAPIResponse[] => {
  if (!Array.isArray(data)) return false;

  return data.every((item) => {
    // 1. Verificación básica de objeto
    if (!item || typeof item !== "object") return false;

    // 2. Verificación de propiedades requeridas con tipos estrictos
    const hasBaseProps =
      typeof item.name?.common === "string" &&
      typeof item.flags?.png === "string" &&
      typeof item.cca3 === "string" &&
      typeof item.population === "number" &&
      typeof item.region === "string";

    // 3. Verificación de arrays (Borders y Capital son opcionales o arrays)
    // Usamos Array.isArray porque es la forma correcta de validar si son listas
    const hasValidLists =
      (item.borders === undefined || Array.isArray(item.borders)) &&
      (item.capital === undefined || Array.isArray(item.capital));

    return hasBaseProps && hasValidLists;
  });
};
