/**
 * Result<T, E> — representa una operación que puede fallar.
 *
 * En lugar de lanzar excepciones para fallos ESPERADOS (red caída,
 * datos corruptos, validación fallida), devolvemos un valor que
 * TypeScript nos obliga a manejar. Las excepciones quedan reservadas
 * para fallos de programación (bugs), no para condiciones del negocio.
 *
 * El type guard `isOk` estrecha a la rama de éxito y `isErr` a la de error.
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Construye un resultado exitoso. */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** Construye un resultado fallido. */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/** Type guard: estrecha a la rama de éxito. */
export const isOk = <T, E>(
  result: Result<T, E>,
): result is { readonly ok: true; readonly value: T } => result.ok;

/** Type guard: estrecha a la rama de error. */
export const isErr = <T, E>(
  result: Result<T, E>,
): result is { readonly ok: false; readonly error: E } => !result.ok;

/** Devuelve el valor, o un fallback si fue error. */
export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  result.ok ? result.value : fallback;

/** Transforma el valor si fue éxito; propaga el error si no. */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.ok ? ok(fn(result.value)) : result);
