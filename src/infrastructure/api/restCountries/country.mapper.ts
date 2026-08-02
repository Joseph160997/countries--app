import type { Country, Region } from "@/domain/country";
import type { RestCountryDTO, RestCountriesResponse } from "./restCountry.dto";

const VALID_REGIONS: readonly Region[] = [
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
];

/**
 * Extrae el array de países desde la respuesta de la API.
 */
export const unwrapResponse = (
  raw: RestCountriesResponse,
): RestCountryDTO[] => {
  return raw.data.objects;
};

/**
 * Convierte un DTO de la API en el modelo que consume la UI.
 */
export const mapToCountry = (
  dto: RestCountryDTO,
  favoriteCodes: readonly string[],
): Country => {
  return {
    cca3: dto.codes.alpha_3,
    name: dto.names.common,
    flag: pickFlag(dto),
    flagAlt: dto.flag.description ?? `Bandera de ${dto.names.common}`,
    population: dto.population,
    region: normalizeRegion(dto.region),
    capital: pickCapital(dto),
    isFavorite: favoriteCodes.includes(dto.codes.alpha_3),
    subregion: dto.subregion ?? "",
    borders: dto.borders ?? [],
    languages: mapLanguages(dto.languages),
    currencies: mapCurrencies(dto.currencies),
    tld: dto.tlds ?? [],
  };
};

/**
 * Prioridad: SVG → PNG.
 */
function pickFlag(dto: RestCountryDTO): string {
  return dto.flag.url_svg || dto.flag.url_png;
}

/**
 * Devuelve la capital principal o un fallback si no existe.
 */
function pickCapital(dto: RestCountryDTO): string {
  if (!dto.capitals || dto.capitals.length === 0) {
    return "No Capital";
  }

  const primary = dto.capitals.find((c) => c.primary);

  return (primary ?? dto.capitals[0]).name;
}

/**
 * Garantiza que la región pertenezca al dominio de la aplicación.
 */
function normalizeRegion(region: string): Region {
  return VALID_REGIONS.includes(region as Region) ? (region as Region) : "";
}

/**
 * Extrae únicamente los nombres de los idiomas.
 */
function mapLanguages(languages: RestCountryDTO["languages"]): string[] {
  if (!languages) return [];

  return languages.map((l) => l.name).filter(Boolean);
}

/**
 * Formatea las monedas para mostrarlas en la UI.
 */
function mapCurrencies(currencies: RestCountryDTO["currencies"]): string[] {
  if (!currencies) return [];

  return currencies.map((c) => `${c.name} (${c.symbol})`).filter(Boolean);
}
