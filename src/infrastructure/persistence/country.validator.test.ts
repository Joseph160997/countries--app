import { describe, expect, it } from "vitest";
import { isCountry } from "./country.validator";

const validCountry = {
  cca3: "COL",
  name: "Colombia",
  flag: "https://example.com/flag.svg",
  flagAlt: "Flag of Colombia",
  population: 52000000,
  region: "Americas" as const,
  capital: "Bogota",
  isFavorite: false,
  subregion: "South America",
  borders: ["BRA"],
  languages: ["Spanish"],
  currencies: ["COP"],
  tld: [".co"],
};

describe("isCountry", () => {
  it("accepts a valid cached country", () => {
    expect(isCountry(validCountry)).toBe(true);
  });

  it("rejects contaminated or malformed cached data", () => {
    expect(isCountry({ ...validCountry, name: 42 })).toBe(false);
    expect(isCountry({ ...validCountry, cca3: "<script>" })).toBe(false);
    expect(isCountry({ ...validCountry, population: Number.NaN })).toBe(false);
    expect(isCountry({ ...validCountry, region: "Unknown" })).toBe(false);
  });
});
