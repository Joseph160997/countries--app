import type { Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import type { WikiSummary } from "@/domain/wiki";

/**
 * Puerto: obtener el resumen de un artículo de Wikipedia
 * a partir de su URL (la que ya trae el país desde REST Countries).
 * El adapter decide cómo parsearla y qué idioma consultar.
 *
 * `signal` es opcional: permite al caller abortar la petición
 * (ej: el usuario cierra el modal mientras el fetch vuela).
 */
export interface WikiProvider {
  getSummaryFromUrl(
    wikipediaUrl: string,
    signal?: AbortSignal,
  ): Promise<Result<WikiSummary, AppError>>;
}
