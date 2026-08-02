import type { Country } from "@/domain/country";
import type { AppError } from "@/domain/errors";
import type { Result } from "@/shared/result";

/**
 * Puerto: el contrato que la aplicación necesita para acceder a países.
 *
 * El dominio lo define, infrastructure lo implementa.
 * Si mañana cambiamos REST Countries por GraphQL, un JSON local
 * o un fake de tests, este archivo NO se toca.
 *
 * Regla de dependencia: este archivo solo importa de domain/ y shared/.
 */
export interface CountryRepository {
  getAll(
    favoriteCodes: readonly string[],
  ): Promise<Result<Country[], AppError>>;
}
