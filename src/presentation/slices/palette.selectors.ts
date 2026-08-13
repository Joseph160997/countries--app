import type { Country } from "@/domain/country";

/**
 * Resultado de búsqueda para el Command Palette.
 * Incluye el país y un "score" de relevancia para ordenar.
 */
export interface PaletteMatch {
  readonly country: Country;
  readonly score: number;
}

/**
 * Busca países para el Command Palette.
 *
 * A diferencia de computeFilteredCountries (que respeta región,
 * favoritos y sort del usuario), esta función busca en TODOS los
 * países y rankea por relevancia de match.
 *
 * Estrategia de scoring (mayor = más relevante):
 * - 100: match exacto en nombre
 * -  80: nombre empieza con query
 * -  60: nombre contiene query
 * -  40: capital contiene query
 * -  20: CCA3 contiene query
 * -   0: no match → excluido
 *
 * @param query - Texto del usuario (ya trimmeado y lowercased por el caller)
 * @param countries - Catálogo completo (sin filtros de grid)
 * @param limit - Máximo de resultados (default: 8)
 */
export const searchForPalette = (
  query: string,
  countries: readonly Country[],
  limit: number = 8,
): Country[] => {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const matches: PaletteMatch[] = [];

  for (const country of countries) {
    const score = computeScore(country, q);
    if (score > 0) {
      matches.push({ country, score });
    }
  }

  // Ordenar por score descendente, luego alfabético como tiebreaker
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.country.name.localeCompare(b.country.name);
  });

  return matches.slice(0, limit).map((m) => m.country);
};

/**
 * Calcula el score de relevancia de un país para una query.
 * Función pura, sin efectos secundarios — testeable en aislamiento.
 */
const computeScore = (country: Country, query: string): number => {
  const name = country.name.toLowerCase();
  const capital = country.capital.toLowerCase();
  const cca3 = country.cca3.toLowerCase();

  if (name === query) return 100;
  if (name.startsWith(query)) return 80;
  if (name.includes(query)) return 60;
  if (capital.includes(query)) return 40;
  if (cca3.includes(query)) return 20;

  return 0;
};
