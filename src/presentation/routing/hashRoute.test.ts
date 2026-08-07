import { describe, expect, it } from "vitest";
import { parseHash, toCountryHash } from "./hashRoute";

describe("parseHash", () => {
  it("should parse a valid country hash", () => {
    expect(parseHash("#/country/COL")).toEqual({
      name: "country",
      cca3: "COL",
    });
  });

  it("should normalize lowercase cca3", () => {
    expect(parseHash("#/country/col")).toEqual({
      name: "country",
      cca3: "COL",
    });
  });

  it("should accept a trailing slash", () => {
    expect(parseHash("#/country/ARG/")).toEqual({
      name: "country",
      cca3: "ARG",
    });
  });

  it("should return null for empty hash", () => {
    expect(parseHash("")).toBeNull();
  });

  it("should return null for unknown routes", () => {
    expect(parseHash("#/compare/COL")).toBeNull();
  });

  it("should return null for invalid cca3 length", () => {
    expect(parseHash("#/country/CO")).toBeNull();
    expect(parseHash("#/country/COLO")).toBeNull();
  });
});

describe("toCountryHash", () => {
  it("should build an uppercase country hash", () => {
    expect(toCountryHash("col")).toBe("#/country/COL");
  });
});
