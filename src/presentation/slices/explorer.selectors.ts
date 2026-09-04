import type { Country } from "@/domain/country";
import type { FiltersSliceState, SortCriteria } from "./filters.slice";

/**
 * Derivación pura: (países, filtros) → lista filtrada y ordenada.
 * Sin efectos secundarios ni estado interno.
 */
export const computeFilteredCountries = (
  all: readonly Country[],
  filters: FiltersSliceState,
): Country[] => {
  const query = filters.query.trim().toLowerCase();

  const filtered = all.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(query);
    const matchesRegion =
      filters.region === "" || country.region === filters.region;
    const matchesFavorites = !filters.showFavorites || country.isFavorite;
    const matchesPopulation =
      filters.minPopulation === 0 ||
      country.population >= filters.minPopulation;
    return (
      matchesSearch && matchesRegion && matchesFavorites && matchesPopulation
    );
  });

  return sortCountries(filtered, filters.sort);
};

/** Ordenamiento puramente funcional */
const sortCountries = (list: Country[], sort: SortCriteria): Country[] => {
  if (sort === "none") return list;
  const copy = [...list]; // nunca mutamos la entrada
  if (sort === "population-desc") {
    copy.sort((a, b) => b.population - a.population);
  } else if (sort === "name-asc") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "area-desc") {
    copy.sort((a, b) => (b.areaKm2 ?? 0) - (a.areaKm2 ?? 0));
  }
  return copy;
};

/**
 * Selección determinista del "País del Día".
 * Mismo día → mismo país para todos los usuarios.
 * Ordenamos por cca3 para que el resultado NO dependa del orden
 * en que la API o el caché devuelven los datos.
 */
export const pickCountryOfTheDay = (
  countries: readonly Country[],
  now: Date = new Date(),
): Country | null => {
  if (countries.length === 0) return null;
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
  );
  const sorted = [...countries].sort((a, b) => a.cca3.localeCompare(b.cca3));
  return sorted[dayOfYear % sorted.length];
};

/** Slide resuelto: país real + etiqueta editorial. */
export interface HeroSlide {
  readonly country: Country;
  readonly badge: string;
  readonly tagline: string;
}

/**
 * Construye el hero con un único slide: el País del Día.
 * Se eliminan los slides adicionales y la curaduría editorial.
 */
export const buildHeroSlides = (
  all: readonly Country[],
  now: Date = new Date(),
): HeroSlide[] => {
  if (all.length === 0) return [];

  const daily = pickCountryOfTheDay(all, now);
  if (!daily) return [];

  return [
    {
      country: daily,
      badge: "Country of the Day",
      tagline: "Today's featured destination — tomorrow brings a new one.",
    },
  ];
};
