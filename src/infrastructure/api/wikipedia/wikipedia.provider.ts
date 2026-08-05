import { err, ok, type Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import type { WikiSummary } from "@/domain/wiki";
import type { WikiProvider } from "@/domain/ports/wiki.provider";
import { httpClient } from "@/infrastructure/http/http.client";
import type { WikipediaSummaryResponse } from "./wikipedia.dto";
import { extractWikiTarget, mapToWikiSummary } from "./wikipedia.mapper";
import { isWikipediaSummary } from "./wikipedia.validator";

/**
 * Adapter: implementa WikiProvider contra la API REST de Wikipedia.
 * Sin API key, CORS habilitado por Wikimedia. Si algo falla → err.
 */
export class WikipediaProvider implements WikiProvider {
  async getSummaryFromUrl(
    wikipediaUrl: string,
  ): Promise<Result<WikiSummary, AppError>> {
    const target = extractWikiTarget(wikipediaUrl);
    if (!target) {
      return err({
        kind: "validation",
        message: `Invalid Wikipedia URL: ${wikipediaUrl}`,
      });
    }

    const url =
      `https://${target.lang}.wikipedia.org/api/rest_v1/page/summary/` +
      encodeURIComponent(target.title);

    try {
      const response = await httpClient<WikipediaSummaryResponse>(
        url,
        { validator: isWikipediaSummary },
        6000,
      );
      return ok(mapToWikiSummary(response, wikipediaUrl));
    } catch (error) {
      return err({
        kind: "network",
        message: "Wikipedia service unavailable",
        cause: error,
      });
    }
  }
}
