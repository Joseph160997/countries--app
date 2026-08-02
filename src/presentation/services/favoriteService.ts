import { storageService } from "@/infrastructure/persistence/localStorage.store";
import { showToast } from "./toast";
import { err, ok, unwrapOr, type Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";

/** Clave única para World Explorer */
export const FAVS_KEY = "world_explorer_favs";

/**
 * Type Guard: Valida que el dato recuperado sea un array de strings (códigos CCA3).
 */
export const isValidFavList = (data: unknown): data is string[] => {
  return Array.isArray(data) && data.every((item) => typeof item === "string");
};

/**
 * Recupera la lista de códigos favoritos.
 *
 * ANTES: devolvía [] tanto para "sin favoritos" como para "datos corruptos"
 *        → el fallo era invisible.
 * AHORA: ok([]) si no hay datos, ok(codes) si son válidos,
 *        err(storage) si están corruptos → el caller decide.
 */
export const getFavoriteCodes = (): Result<string[], AppError> => {
  const data = storageService.get<unknown>(FAVS_KEY);

  if (data === null) return ok([]);
  if (isValidFavList(data)) return ok(data);

  return err({
    kind: "storage",
    message: `Favorites data is corrupt: ${JSON.stringify(data)}`,
  });
};

/**
 * Determina si un país específico es favorito por su código.
 */
export const isCountryFavorite = (cca3: string): boolean => {
  return unwrapOr(getFavoriteCodes(), []).includes(cca3);
};

/**
 * Lógica de negocio para agregar/quitar favoritos.
 */
export const toggleFavoritePersistence = (cca3: string): boolean => {
  const favorites = unwrapOr(getFavoriteCodes(), []);
  const isFav = favorites.includes(cca3);

  const updatedFavs = isFav
    ? favorites.filter((id) => id !== cca3)
    : [...favorites, cca3];

  storageService.save(FAVS_KEY, updatedFavs);

  showToast(
    isFav ? "Removed from favorites" : "Added to favorites",
    isFav ? "info" : "success",
  );

  return !isFav;
};
