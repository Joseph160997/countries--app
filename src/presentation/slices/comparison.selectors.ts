import type { Country } from "@/domain/country";
import { getAllCountries } from "@/presentation/state/countryState";
import { getComparisonCodes } from "@/presentation/state/countryState";

/**
 * Una fila de la tabla comparativa.
 *
 * label: nombre del atributo ("Population", "Capital", etc.)
 * values: un valor formateado por cada país seleccionado.
 *   Si hay 3 países, values tiene 3 elementos.
 *   Si un país no tiene el dato, su posición lleva "N/A".
 *
 * El componente de comparación recibe esto y NO necesita saber
 * nada sobre la entidad Country. Solo renderiza filas genéricas.
 */
export interface ComparisonRow {
  readonly label: string;
  readonly values: readonly string[];
}

/**
 * Selector de composición: cruza el slice de comparación con el catálogo.
 *
 * comparisonStore.selectedCodes → ["COL", "ARG"]
 * countriesStore.all            → [{cca3:"COL",...}, {cca3:"ARG",...}, ...]
 * Resultado                     → [Country_COL, Country_ARG]
 *
 * Es un "join" por CCA3. Si un CCA3 seleccionado no existe en el catálogo
 * (edge case: datos corruptos o API incompleta), simplemente lo saltamos.
 * No lanzamos error porque la comparación es una feature de UI, no crítica.
 */
export const getComparisonCountries = (): readonly Country[] => {
  const codes = getComparisonCodes();
  const catalog = getAllCountries();

  // Por cada código seleccionado, buscamos el país en el catálogo.
  // .flatMap en vez de .map + .filter: más legible para "busca y descarta null".
  return codes.flatMap((code) => {
    const found = catalog.find((c) => c.cca3 === code);
    return found ? [found] : [];
  });
};

/**
 * Construye las filas de la tabla comparativa.
 *
 * Cada fila es un atributo del país formateado como string.
 * La función es pura: no lee estado, solo transforma Country[] → ComparisonRow[].
 * Esto la hace trivialmente testeable.
 *
 * @param countries - Los países a comparar (2 o 3, ya resueltos)
 */
export const buildComparisonRows = (
  countries: readonly Country[],
): ComparisonRow[] => {
  // Helper local: formatea un valor opcional.
  // Si es undefined/null → "N/A". Si existe → aplica el formateador.
  const fmt = <T>(
    value: T | undefined | null,
    formatter: (v: T) => string,
  ): string =>
    value !== undefined && value !== null ? formatter(value) : "N/A";

  return [
    {
      label: "Region",
      values: countries.map((c) => c.region || "N/A"),
    },
    {
      label: "Subregion",
      values: countries.map((c) => c.subregion || "N/A"),
    },
    {
      label: "Capital",
      values: countries.map((c) => c.capital || "N/A"),
    },
    {
      label: "Population",
      values: countries.map((c) =>
        fmt(c.population, (v) => v.toLocaleString()),
      ),
    },
    {
      label: "Area",
      values: countries.map((c) =>
        fmt(c.areaKm2, (v) => `${v.toLocaleString()} km²`),
      ),
    },
    {
      label: "Density",
      values: countries.map((c) =>
        fmt(c.density, (v) => `${v.toLocaleString()} /km²`),
      ),
    },
    {
      label: "Languages",
      values: countries.map((c) =>
        c.languages.length > 0 ? c.languages.join(", ") : "N/A",
      ),
    },
    {
      label: "Currencies",
      values: countries.map((c) =>
        c.currencies.length > 0 ? c.currencies.join(", ") : "N/A",
      ),
    },
    {
      label: "Memberships",
      values: countries.map((c) =>
        c.memberships && c.memberships.length > 0
          ? c.memberships.join(", ")
          : "N/A",
      ),
    },
    {
      label: "Landlocked",
      values: countries.map((c) =>
        fmt(c.landlocked, (v) => (v ? "Yes" : "No")),
      ),
    },
    {
      label: "Driving Side",
      values: countries.map((c) =>
        fmt(c.drivingSide, (v) => v.charAt(0).toUpperCase() + v.slice(1)),
      ),
    },
    {
      label: "Timezones",
      values: countries.map((c) =>
        c.timezones && c.timezones.length > 0 ? c.timezones[0] : "N/A",
      ),
    },
    {
      label: "Calling Codes",
      values: countries.map((c) =>
        c.callingCodes && c.callingCodes.length > 0
          ? c.callingCodes.join(", ")
          : "N/A",
      ),
    },
    {
      label: "Top Level Domain",
      values: countries.map((c) =>
        c.tld.length > 0 ? c.tld.join(", ") : "N/A",
      ),
    },
  ];
};
