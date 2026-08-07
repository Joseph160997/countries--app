/** Ruta de un país */
export interface CountryRoute {
  readonly name: "country";
  readonly cca3: string;
}

const COUNTRY_HASH_PATTERN = /^#\/country\/([a-zA-Z]{3})\/?$/;

/**
 * Parsea el hash actual de la URL.
 *
 * Ejemplos:
 * - "#/country/COL" → { name: "country", cca3: "COL" }
 * - "#/country/col/" → { name: "country", cca3: "COL" }
 * - "#/compare/COL" → null
 * - "invalid" → null
 */
export const parseHash = (hash: string): CountryRoute | null => {
  const match = COUNTRY_HASH_PATTERN.exec(hash.trim());
  if (!match) return null;

  return {
    name: "country",
    cca3: match[1].toUpperCase(),
  };
};

/** Convierte un cca3 a una ruta de hash */
export const toCountryHash = (cca3: string): string =>
  `#/country/${cca3.toUpperCase()}`;
