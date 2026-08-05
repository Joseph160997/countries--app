import type { WikiSummary } from "@/domain/wiki";
import type { WikipediaSummaryResponse } from "./wikipedia.dto";

export interface WikiTarget {
  readonly lang: string;
  readonly title: string;
}

/**
 * Extrae idioma y título de una URL de Wikipedia.
 * "https://es.wikipedia.org/wiki/Colombia" → { lang: "es", title: "Colombia" }
 * null si la URL no tiene la forma esperada.
 */
export const extractWikiTarget = (url: string): WikiTarget | null => {
  try {
    const parsed = new URL(url);
    const langMatch = parsed.hostname.match(/^([a-z-]+)\.wikipedia\.org$/);
    const lang = langMatch ? langMatch[1] : "en";
    const title = decodeURIComponent(parsed.pathname.replace(/^\/wiki\//, ""));
    return title ? { lang, title } : null;
  } catch {
    return null;
  }
};

export const mapToWikiSummary = (
  dto: WikipediaSummaryResponse,
  fallbackUrl: string,
): WikiSummary => ({
  extract: dto.extract,
  thumbnail: dto.thumbnail?.source ?? null,
  pageUrl: dto.content_urls?.desktop?.page ?? fallbackUrl,
});
