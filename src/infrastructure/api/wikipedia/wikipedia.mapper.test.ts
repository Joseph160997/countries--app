import { describe, expect, it } from "vitest";
import { extractWikiTarget, mapToWikiSummary } from "./wikipedia.mapper";
import type { WikipediaSummaryResponse } from "./wikipedia.dto";

describe("extractWikiTarget", () => {
  it("should extract lang and title from a standard URL", () => {
    expect(extractWikiTarget("https://en.wikipedia.org/wiki/Colombia")).toEqual(
      {
        lang: "en",
        title: "Colombia",
      },
    );
  });

  it("should decode URI-encoded titles and detect language", () => {
    const target = extractWikiTarget(
      "https://es.wikipedia.org/wiki/Rep%C3%BAblica_Dominicana",
    );
    expect(target).toEqual({ lang: "es", title: "República_Dominicana" });
  });

  it("should return null for invalid URLs", () => {
    expect(extractWikiTarget("not a url")).toBeNull();
  });
});

describe("mapToWikiSummary", () => {
  const baseResponse: WikipediaSummaryResponse = {
    title: "Colombia",
    extract: "Colombia, officially the Republic of Colombia...",
    thumbnail: { source: "https://upload.wikimedia.org/colombia.jpg" },
    content_urls: {
      desktop: { page: "https://en.wikipedia.org/wiki/Colombia" },
    },
  };

  it("should map extract, thumbnail and page url", () => {
    const result = mapToWikiSummary(baseResponse, "fallback");
    expect(result.extract).toContain("Republic of Colombia");
    expect(result.thumbnail).toBe("https://upload.wikimedia.org/colombia.jpg");
    expect(result.pageUrl).toBe("https://en.wikipedia.org/wiki/Colombia");
  });

  it("should fall back to null thumbnail and the original url", () => {
    const minimal: WikipediaSummaryResponse = { title: "X", extract: "text" };
    const result = mapToWikiSummary(minimal, "https://fallback.url");
    expect(result.thumbnail).toBeNull();
    expect(result.pageUrl).toBe("https://fallback.url");
  });
});
