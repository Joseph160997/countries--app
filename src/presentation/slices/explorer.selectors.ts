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

/** Entrada curada del carrusel. */
export interface FeaturedEntry {
  readonly cca3: string;
  readonly badge: string;
  readonly tagline: string;
}

/** Slide resuelto: país real + etiqueta editorial. */
export interface HeroSlide {
  readonly country: Country;
  readonly badge: string;
  readonly tagline: string;
}

/**
 * Contenido editorial curado del hero.
 * Sin datos de turismo en la API, la curaduría es el camino honesto.
 */
export const FEATURED_COUNTRIES: readonly FeaturedEntry[] = [
  {
    cca3: "FRA",
    badge: "Most Touristic",
    tagline:
      "The world's most visited destination — art, gastronomy and the City of Light.",
  },
  {
    cca3: "JPN",
    badge: "Cultural Icon",
    tagline:
      "Ancient temples and neon skylines — the planet's most fascinating contrast.",
  },
  {
    cca3: "ISL",
    badge: "Hidden Gem",
    tagline:
      "Volcanoes, glaciers and northern lights on one impossible island.",
  },
  {
    cca3: "BRA",
    badge: "Natural Wonder",
    tagline: "Home to the Amazon — the most biodiverse country on Earth.",
  },
  {
    cca3: "ITA",
    badge: "Heritage Giant",
    tagline: "More UNESCO World Heritage sites than any other country.",
  },
];

/**
 * Construye los slides del hero: País del Día primero,
 * luego los destacados que existan en la lista cargada.
 * Sin duplicados si el país del día coincide con un destacado.
 */
export const buildHeroSlides = (
  all: readonly Country[],
  featured: readonly FeaturedEntry[] = FEATURED_COUNTRIES,
  now: Date = new Date(),
): HeroSlide[] => {
  if (all.length === 0) return [];

  const slides: HeroSlide[] = [];
  const daily = pickCountryOfTheDay(all, now);

  if (daily) {
    slides.push({
      country: daily,
      badge: "Country of the Day",
      tagline: "Today's featured destination — tomorrow brings a new one.",
    });
  }

  for (const entry of featured) {
    if (daily?.cca3 === entry.cca3) continue;
    const country = all.find((c) => c.cca3 === entry.cca3);
    if (country) {
      slides.push({ country, badge: entry.badge, tagline: entry.tagline });
    }
  }

  return slides;
};
