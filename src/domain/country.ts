export type Region = "Africa" | "Americas" | "Asia" | "Europe" | "Oceania" | "";

export const VALID_REGIONS: readonly Region[] = [
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
];

export const isRegion = (value: string): value is Region =>
  value === "" || VALID_REGIONS.includes(value as Region);

export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

export interface CountryLinks {
  readonly googleMaps?: string;
  readonly openStreetMaps?: string;
  readonly wikipedia?: string;
}

export interface Country {
  cca3: string;
  name: string;
  flag: string;
  flagAlt: string;
  population: number;
  region: Region;
  capital: string;
  isFavorite: boolean;
  subregion: string;
  borders: string[];
  languages: string[];
  currencies: string[];
  tld: string[];

  // ── Fase 3: datos de ficha ──
  // Opcionales mientras la fuente madura; el mapper los rellena cuando vienen.
  areaKm2?: number; // 0/undefined si no viene
  density?: number; // hab/km² calculada
  coordinates?: GeoPoint; // centroide del país
  capitalCoordinates?: GeoPoint; // para el clima (Fase 3.2)
  timezones?: string[];
  callingCodes?: string[];
  drivingSide?: "left" | "right";
  landlocked?: boolean;
  memberships?: string[]; // ["UN","EU","NATO","G7","G20","Schengen"]
  links?: CountryLinks;
}
