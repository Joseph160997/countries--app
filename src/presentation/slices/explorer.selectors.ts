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
