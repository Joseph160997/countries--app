import {
  isRegion,
  type Country,
  type CountryLinks,
  type GeoPoint,
  type Region,
} from "@/domain/country";
import type { RestCountryDTO, RestCountriesResponse } from "./restCountry.dto";

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

    // ── Fase 3 ──
    areaKm2: dto.area?.kilometers,
    density: computeDensity(dto.population, dto.area),
    coordinates: pickCoordinates(dto),
    capitalCoordinates: pickCapitalCoordinates(dto),
    timezones: dto.timezones,
    callingCodes: dto.calling_codes,
    drivingSide: dto.car?.driving_side,
    landlocked: dto.landlocked,
    memberships: mapMemberships(dto.memberships),
    links: mapLinks(dto.links),
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
  return isRegion(region) ? region : "";
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
const MEMBERSHIP_LABELS: Record<string, string> = {
  un: "UN",
  eu: "EU",
  nato: "NATO",
  g7: "G7",
  g20: "G20",
  schengen: "Schengen",
};

/** Calcula la densidad poblacional del país. */
function computeDensity(
  population: number,
  area?: { kilometers: number },
): number | undefined {
  if (!area || area.kilometers <= 0) return undefined;
  return Math.round(population / area.kilometers);
}

/** Extrae las coordenadas de la capital. */
function pickCoordinates(dto: RestCountryDTO): GeoPoint | undefined {
  if (!dto.coordinates) return undefined;
  return { lat: dto.coordinates.lat, lng: dto.coordinates.lng };
}

function pickCapitalCoordinates(dto: RestCountryDTO): GeoPoint | undefined {
  if (!dto.capitals || dto.capitals.length === 0) return undefined;
  const primary = dto.capitals.find((c) => c.primary) ?? dto.capitals[0];
  if (!primary.coordinates) return undefined;
  return { lat: primary.coordinates.lat, lng: primary.coordinates.lng };
}

/** Extrae las membresías del Comité Olímpico Internacional. */
function mapMemberships(
  memberships?: Record<string, boolean>,
): string[] | undefined {
  if (!memberships) return undefined;
  const labels = Object.entries(memberships)
    .filter(([, isMember]) => isMember)
    .map(([key]) => MEMBERSHIP_LABELS[key] ?? key.toUpperCase());
  return labels.length > 0 ? labels : undefined;
}

function mapLinks(links?: RestCountryDTO["links"]): CountryLinks | undefined {
  if (!links) return undefined;
  return {
    googleMaps: links.google_maps,
    openStreetMaps: links.open_street_maps,
    wikipedia: links.wikipedia,
  };
}
