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
    // Verificación posicional indexada de alta velocidad
    isFavorite: favoriteCodes.includes(country.cca3),
  };
};

/**
 * Validador manual (Type Guard) para la respuesta de la API.
 * Verifica la existencia de campos críticos antes de procesar los datos [4].
 */
export const isRestCountryResponse = (
  data: unknown,
): data is RestCountryAPIResponse[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.name?.common === "string" &&
        typeof item.flags?.png === "string" &&
        typeof item.cca3 === "string" &&
        typeof item.population === "number" &&
        typeof item.region === "string",
    )
  );
};
