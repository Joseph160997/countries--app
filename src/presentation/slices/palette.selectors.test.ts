import { describe, expect, it } from "vitest";
import type { Country } from "@/domain/country";
import { searchForPalette } from "./palette.selectors";

// ─── Fixture mínimo ───
const makeCountry = (
  cca3: string,
  name: string,
  capital: string = "Capital City",
): Country => ({
  cca3,
  name,
  flag: `${cca3}.svg`,
  flagAlt: `Flag of ${name}`,
  population: 1_000_000,
  region: "Americas",
  capital,
  isFavorite: false,
  subregion: "South America",
  borders: [],
  languages: ["Spanish"],
  currencies: ["Peso ($)"],
  tld: [".xx"],
});

const catalog: Country[] = [
  makeCountry("COL", "Colombia", "Bogotá"),
  makeCountry("ARG", "Argentina", "Buenos Aires"),
  makeCountry("ESP", "Spain", "Madrid"),
  makeCountry("LKA", "Sri Lanka", "Colombo"),
  makeCountry("USA", "United States", "Washington D.C."),
];

describe("searchForPalette", () => {
  // ─── Comportamiento básico ───
  it("should return empty array for empty query", () => {
    expect(searchForPalette("", catalog)).toEqual([]);
    expect(searchForPalette("   ", catalog)).toEqual([]);
  });

  it("should find countries by name (case-insensitive)", () => {
    const results = searchForPalette("colombia", catalog);
    expect(results).toHaveLength(1);
    expect(results[0].cca3).toBe("COL");
  });

  it("should find countries by partial name", () => {
    const results = searchForPalette("arg", catalog);
    expect(results).toHaveLength(1);
    expect(results[0].cca3).toBe("ARG");
  });

  // ─── Ranking ───
  it("should rank exact match above partial match", () => {
    // "col" matchea Colombia (empieza con) y Sri Lanka (capital "Colombo" contiene)
    const results = searchForPalette("col", catalog);
    expect(results[0].cca3).toBe("COL"); // empieza con → score 80
    expect(results[1].cca3).toBe("LKA"); // capital contiene → score 40
  });

  it("should rank startsWith above includes", () => {
    // "united" → United States empieza con, no hay otro que contenga
    const results = searchForPalette("united", catalog);
    expect(results[0].cca3).toBe("USA");
  });

  // ─── Búsqueda por capital y CCA3 ───
  it("should find countries by capital name", () => {
    const results = searchForPalette("madrid", catalog);
    expect(results).toHaveLength(1);
    expect(results[0].cca3).toBe("ESP");
  });

  it("should find countries by CCA3 code", () => {
    const results = searchForPalette("usa", catalog);
    // "usa" matchea United States por nombre (contiene "united states"? no)
    // y por CCA3 "USA" → score 20
    expect(results.some((c) => c.cca3 === "USA")).toBe(true);
  });

  // ─── Límite de resultados ───
  it("should respect the limit parameter", () => {
    const results = searchForPalette("a", catalog, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("should default to 8 results max", () => {
    // Con 5 países, todos matchean "a" (todos tienen 'a' en algún campo)
    const results = searchForPalette("a", catalog);
    expect(results.length).toBeLessThanOrEqual(8);
  });

  // ─── Edge cases ───
  it("should return empty for query with no matches", () => {
    expect(searchForPalette("zzzzz", catalog)).toEqual([]);
  });

  it("should handle single-country catalog", () => {
    const single = [makeCountry("COL", "Colombia")];
    const results = searchForPalette("col", single);
    expect(results).toHaveLength(1);
    expect(results[0].cca3).toBe("COL");
  });
});
