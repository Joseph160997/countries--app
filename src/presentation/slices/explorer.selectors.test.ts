import { describe, expect, it } from "vitest";
import type { Country } from "@/domain/country";
import { pickCountryOfTheDay } from "./explorer.selectors";

const makeCountry = (cca3: string, name: string): Country => ({
  cca3,
  name,
  flag: `${cca3}.svg`,
  flagAlt: `Flag of ${name}`,
  population: 1_000_000,
  region: "Americas",
  capital: "Capital City",
  isFavorite: false,
  subregion: "South America",
  borders: [],
  languages: ["Spanish"],
  currencies: ["Peso ($)"],
  tld: [".xx"],
});

const sample: Country[] = [
  makeCountry("COL", "Colombia"),
  makeCountry("ARG", "Argentina"),
  makeCountry("ESP", "Spain"),
];

describe("pickCountryOfTheDay", () => {
  it("should return null for an empty list", () => {
    expect(pickCountryOfTheDay([], new Date("2026-08-06"))).toBeNull();
  });

  it("should be deterministic for the same date", () => {
    const a = pickCountryOfTheDay(sample, new Date("2026-08-06"));
    const b = pickCountryOfTheDay(sample, new Date("2026-08-06"));
    expect(a?.cca3).toBe(b?.cca3);
  });

  it("should not depend on input order", () => {
    const reversed = [...sample].reverse();
    const a = pickCountryOfTheDay(sample, new Date("2026-08-06"));
    const b = pickCountryOfTheDay(reversed, new Date("2026-08-06"));
    expect(a?.cca3).toBe(b?.cca3);
  });

  it("should always return an element of the list", () => {
    const result = pickCountryOfTheDay(sample, new Date("2026-08-06"));
    expect(sample.map((c) => c.cca3)).toContain(result?.cca3);
  });
});
import { buildHeroSlides } from "./explorer.selectors";

describe("buildHeroSlides", () => {
  it("should return only the country of the day", () => {
    const date = new Date("2026-08-06");
    const slides = buildHeroSlides(sample, date);
    expect(slides).toHaveLength(1);
    expect(slides[0].badge).toBe("Country of the Day");
    expect(slides[0].country.cca3).toBe(
      pickCountryOfTheDay(sample, date)?.cca3,
    );
  });
});
