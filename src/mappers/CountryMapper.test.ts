import { describe, expect, it } from "vitest";

import { mapCountry, isRestCountryResponse } from "./CountryMapper";
import type { RestCountryAPIResponse } from "../types/Country";

// ======================================================
// FACTORY
// ======================================================

const createApiCountry = (
  overrides: Partial<RestCountryAPIResponse> = {},
): RestCountryAPIResponse => ({
  name: {
    common: "Colombia",
  },

  flags: {
    svg: "https://flagcdn.com/w320/co.svg",
    png: "https://flagcdn.com/w320/co.png",
  },

  cca3: "COL",

  population: 51_049_498,

  region: "Americas",

  capital: ["Bogotá"],

  borders: ["BRA", "ECU", "PAN", "PER", "VEN"],

  ...overrides, // <=== Overrides nos permite pasar parámetros adicionales, o sobreescribirlos.
});

// ======================================================
// mapCountry
// ======================================================

describe("mapCountry", () => {
  it("should transform API data into UI model correctly", () => {
    // Arrange
    const apiData = createApiCountry();
    const favoriteCodes = ["COL", "MEX"];

    // Act
    const result = mapCountry(apiData, favoriteCodes);

    // Assert
    // We use toEqual (not toMatchObject) because we know the exact shape
    // of the expected object: it also catches unwanted extra properties.
    expect(result).toEqual({
      name: "Colombia",
      flag: "https://flagcdn.com/w320/co.svg",
      population: 51_049_498,
      region: "Americas",
      capital: "Bogotá",
      cca3: "COL",
      borders: ["BRA", "ECU", "PAN", "PER", "VEN"],
      isFavorite: true,
    });
  });

  it("should return isFavorite false when country is not in favorites", () => {
    // Arrange
    const apiData = createApiCountry();

    // Act
    const result = mapCountry(apiData, ["MEX", "ARG"]);

    // Assert
    expect(result.isFavorite).toBe(false);
  });

  it("should return isFavorite false when favorites list is empty", () => {
    // Arrange
    const apiData = createApiCountry();

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.isFavorite).toBe(false);
  });

  it("should return 'No Capital' when country has no capital", () => {
    // Arrange
    const apiData = createApiCountry({ capital: undefined });

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.capital).toBe("No Capital");
  });

  it("should return 'No Capital' when capital array is empty", () => {
    // Arrange: capital: [] is a different case from capital: undefined,
    // and country.capital?.[0] also returns undefined here -> "No Capital"
    const apiData = createApiCountry({ capital: [] });

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.capital).toBe("No Capital");
  });

  it("should use png flag when svg is unavailable (empty string)", () => {
    // Arrange
    const apiData = createApiCountry({
      flags: {
        svg: "",
        png: "https://flagcdn.com/w320/co.png",
      },
    });

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.flag).toBe("https://flagcdn.com/w320/co.png");
  });

  it("should return empty string as flag when both svg and png are empty", () => {
    // Arrange: documents the current fallback chain behavior
    // (country.flags.svg || country.flags.png), which has no third
    // fallback if both come back empty.
    const apiData = createApiCountry({
      flags: { svg: "", png: "" },
    });

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.flag).toBe("");
  });

  it("should return empty borders array when borders are missing", () => {
    // Arrange
    const apiData = createApiCountry({ borders: undefined });

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.borders).toEqual([]);
  });

  it("should return empty string as region when region is missing", () => {
    // Arrange
    const apiData = createApiCountry({
      region: undefined as unknown as RestCountryAPIResponse["region"],
    });

    // Act
    const result = mapCountry(apiData, []);

    // Assert
    expect(result.region).toBe("");
  });
});

// ======================================================
// isRestCountryResponse
// ======================================================

describe("isRestCountryResponse", () => {
  it("should return true for valid API response", () => {
    // Arrange
    const validData = [createApiCountry()];

    // Act
    const result = isRestCountryResponse(validData);

    // Assert
    expect(result).toBe(true);
  });

  it("should return false for an empty array", () => {
    // Arrange / Act
    // An empty array is treated as an invalid response on purpose:
    // without this check, [].every() would resolve to true by default
    // in JS, silently letting an empty/broken API response through.
    const result = isRestCountryResponse([]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false for null", () => {
    expect(isRestCountryResponse(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isRestCountryResponse(undefined)).toBe(false);
  });

  it("should return false for objects (non-arrays)", () => {
    expect(isRestCountryResponse({})).toBe(false);
  });

  it("should return false for strings", () => {
    expect(isRestCountryResponse("hello")).toBe(false);
  });

  it("should return false when array contains null values", () => {
    // Arrange
    const invalidData = [createApiCountry(), null];

    // Act
    const result = isRestCountryResponse(invalidData);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when name.common is missing", () => {
    // Arrange
    const invalidCountry = { ...createApiCountry(), name: undefined };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when cca3 is missing", () => {
    // Arrange
    const invalidCountry = { ...createApiCountry(), cca3: undefined };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when flags.png is missing", () => {
    // Arrange: the actual validation depends on flags.png, not flags.svg
    const invalidCountry = {
      ...createApiCountry(),
      flags: { svg: "https://flagcdn.com/w320/co.svg" },
    };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return true even when flags.svg is missing (only png is validated)", () => {
    // Arrange: documents that the type guard does NOT require svg, only png.
    const dataWithoutSvg = {
      ...createApiCountry(),
      flags: { png: "https://flagcdn.com/w320/co.png" },
    };

    // Act
    const result = isRestCountryResponse([dataWithoutSvg]);

    // Assert
    expect(result).toBe(true);
  });

  it("should return false when population is not a number", () => {
    // Arrange
    const invalidCountry = { ...createApiCountry(), population: "50 million" };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when region is not a string", () => {
    // Arrange
    const invalidCountry = { ...createApiCountry(), region: 123 };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when borders is not an array", () => {
    // Arrange
    const invalidCountry = { ...createApiCountry(), borders: "BRA,PER" };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when capital is not an array", () => {
    // Arrange
    const invalidCountry = { ...createApiCountry(), capital: "Bogotá" };

    // Act
    const result = isRestCountryResponse([invalidCountry]);

    // Assert
    expect(result).toBe(false);
  });

  it("should return true when borders and capital are missing (they are optional)", () => {
    // Arrange
    const dataWithoutOptionals = {
      ...createApiCountry(),
      borders: undefined,
      capital: undefined,
    };

    // Act
    const result = isRestCountryResponse([dataWithoutOptionals]);

    // Assert
    expect(result).toBe(true);
  });
});
