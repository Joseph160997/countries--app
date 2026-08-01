// src/mappers/CountryMapper.test.ts
import { describe, it, expect } from "vitest";
import { mapToCountry, unwrapResponse } from "./CountryMapper";
import type {
  RestCountryDTO,
  RestCountriesResponse,
} from "../types/RestCountryDTO";

// FIXTURES (Datos de prueba reutilizables)

/**
 * DTO base completo que representa un país real.
 * Lo usamos como base y lo sobreescribimos en cada test
 * usando spread operator para no mutar el original.
 */
const baseDtoComplete: RestCountryDTO = {
  codes: {
    alpha_2: "CO",
    alpha_3: "COL",
  },
  names: {
    common: "Colombia",
    official: "Republic of Colombia",
  },
  flag: {
    url_svg: "https://flags.example.com/co.svg",
    url_png: "https://flags.example.com/co.png",
    description: "Flag of Colombia",
  },
  population: 51000000,
  region: "Americas",
  subregion: "South America",
  capitals: [
    { name: "Bogotá", primary: true },
    { name: "Medellín", primary: false },
  ],
  borders: ["VEN", "PAN", "ECU"],
  languages: [{ name: "Spanish", bcp47: "es" }],
  currencies: [{ code: "COP", name: "Colombian Peso", symbol: "$" }],
  tlds: [".co"],
};

// TESTS

describe("CountryMapper", () => {
  // ====================================================
  // unwrapResponse
  // ====================================================
  describe("unwrapResponse", () => {
    it("should extract the objects array from the API response", () => {
      // Arrange
      const mockResponse: RestCountriesResponse = {
        data: {
          objects: [baseDtoComplete],
          meta: {
            total: 1,
            count: 1,
            limit: 25,
            offset: 0,
            more: false,
          },
        },
      };

      // Act
      const result = unwrapResponse(mockResponse);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(baseDtoComplete);
    });
  });

  // ====================================================
  // mapToCountry — campos base
  // ====================================================
  describe("mapToCountry", () => {
    it("should map a complete DTO to a Country correctly", () => {
      // Act
      const result = mapToCountry(baseDtoComplete, []);

      // Assert
      expect(result.cca3).toBe("COL");
      expect(result.name).toBe("Colombia");
      expect(result.population).toBe(51000000);
      expect(result.region).toBe("Americas");
      expect(result.subregion).toBe("South America");
      expect(result.borders).toEqual(["VEN", "PAN", "ECU"]);
      expect(result.tld).toEqual([".co"]);
    });

    // ====================================================
    // pickFlag
    // ====================================================
    describe("pickFlag", () => {
      it("should use SVG url when available", () => {
        const result = mapToCountry(baseDtoComplete, []);
        expect(result.flag).toBe("https://flags.example.com/co.svg");
      });

      it("should fallback to PNG when SVG is empty", () => {
        // Arrange — sobreescribimos solo el flag
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          flag: {
            ...baseDtoComplete.flag,
            url_svg: "", // sin SVG para el test.
          },
        };

        // Act
        const result = mapToCountry(dto, []);

        // Assert
        expect(result.flag).toBe("https://flags.example.com/co.png");
      });
    });

    // ====================================================
    // flagAlt
    // ====================================================
    describe("flagAlt", () => {
      it("should use description when available", () => {
        const result = mapToCountry(baseDtoComplete, []);
        expect(result.flagAlt).toBe("Flag of Colombia");
      });

      it("should generate fallback when description is missing", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          flag: {
            ...baseDtoComplete.flag,
            description: undefined,
          },
        };

        const result = mapToCountry(dto, []);
        expect(result.flagAlt).toBe("Bandera de Colombia");
      });
    });

    // ====================================================
    // pickCapital
    // ====================================================
    describe("pickCapital", () => {
      it("should use the primary capital when available", () => {
        const result = mapToCountry(baseDtoComplete, []);
        expect(result.capital).toBe("Bogotá");
      });

      it("should use first capital when none is marked as primary", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          capitals: [
            { name: "Bogotá", primary: false },
            { name: "Medellín", primary: false },
          ],
        };

        const result = mapToCountry(dto, []);
        expect(result.capital).toBe("Bogotá");
      });

      it("should return 'No Capital' when capitals array is empty", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          capitals: [],
        };

        const result = mapToCountry(dto, []);
        expect(result.capital).toBe("No Capital");
      });

      it("should return 'No Capital' when capitals is undefined", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          capitals: undefined,
        };

        const result = mapToCountry(dto, []);
        expect(result.capital).toBe("No Capital");
      });
    });

    // ====================================================
    // normalizeRegion
    // ====================================================
    describe("normalizeRegion", () => {
      it.each([["Africa"], ["Americas"], ["Asia"], ["Europe"], ["Oceania"]])(
        "should keep '%s' as a valid region",
        (region) => {
          const dto: RestCountryDTO = { ...baseDtoComplete, region };
          const result = mapToCountry(dto, []);
          expect(result.region).toBe(region);
        },
      );

      it("should return empty string for unknown regions", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          region: "Antarctica",
        };

        const result = mapToCountry(dto, []);
        expect(result.region).toBe("");
      });
    });

    // ====================================================
    // isFavorite
    // ====================================================
    describe("isFavorite", () => {
      it("should mark as favorite when cca3 is in favoriteCodes", () => {
        const result = mapToCountry(baseDtoComplete, ["COL", "ARG"]);
        expect(result.isFavorite).toBe(true);
      });

      it("should not mark as favorite when cca3 is not in favoriteCodes", () => {
        const result = mapToCountry(baseDtoComplete, ["ARG", "ESP"]);
        expect(result.isFavorite).toBe(false);
      });

      it("should not mark as favorite when favoriteCodes is empty", () => {
        const result = mapToCountry(baseDtoComplete, []);
        expect(result.isFavorite).toBe(false);
      });
    });

    // ====================================================
    // mapLanguages
    // ====================================================
    describe("languages", () => {
      it("should map language names correctly", () => {
        const result = mapToCountry(baseDtoComplete, []);
        expect(result.languages).toEqual(["Spanish"]);
      });

      it("should return empty array when languages is undefined", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          languages: undefined,
        };

        const result = mapToCountry(dto, []);
        expect(result.languages).toEqual([]);
      });
    });

    // ====================================================
    // mapCurrencies
    // ====================================================
    describe("currencies", () => {
      it("should format currencies as 'Name (Symbol)'", () => {
        const result = mapToCountry(baseDtoComplete, []);
        expect(result.currencies).toEqual(["Colombian Peso ($)"]);
      });

      it("should return empty array when currencies is undefined", () => {
        const dto: RestCountryDTO = {
          ...baseDtoComplete,
          currencies: undefined,
        };

        const result = mapToCountry(dto, []);
        expect(result.currencies).toEqual([]);
      });
    });
  });
});
