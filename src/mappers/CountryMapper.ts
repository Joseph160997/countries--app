import type { Country, RestCountryAPIResponse } from "../types/Country";

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
    region: country.region,
    // Evaluación de cortocircuito (Short-circuit evaluation) para campos opcionales
    capital: country.capital?.[0] || "No Capital",
    cca3: country.cca3,
    // Verificación posicional indexada de alta velocidad
    isFavorite: favoriteCodes.includes(country.cca3),
  };
};
