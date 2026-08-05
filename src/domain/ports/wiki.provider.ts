import type { Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import type { WikiSummary } from "@/domain/wiki";

/**
 * Puerto: obtener el resumen de un artículo de Wikipedia
 * a partir de su URL (la que ya trae el país desde REST Countries).
 * El adapter decide cómo parsearla y qué idioma consultar.
 */
export interface WikiProvider {
  getSummaryFromUrl(
    wikipediaUrl: string,
  ): Promise<Result<WikiSummary, AppError>>;
}
