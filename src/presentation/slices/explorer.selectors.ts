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
