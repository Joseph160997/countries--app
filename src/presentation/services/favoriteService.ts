import {
  FAVS_KEY,
  isValidFavList,
  loadFavorites,
} from "@/infrastructure/persistence/favorites.store";
import { unwrapOr, type Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";
import { toggleFavorite } from "@/application/toggleFavorite.usecase";
import { showToast } from "./toast";

// Re-exports para no romper a quienes ya importaban desde aquí
export { FAVS_KEY, isValidFavList };

/** Recupera los códigos favoritos como Result. */
export const getFavoriteCodes = (): Result<string[], AppError> =>
  loadFavorites();

/** ¿Es favorito este país? */
export const isCountryFavorite = (cca3: string): boolean =>
  unwrapOr(getFavoriteCodes(), []).includes(cca3);

/**
 * Alterna un favorito y muestra el feedback visual.
 * La lógica de negocio vive en el caso de uso; aquí solo
 * orquestamos el toast (responsabilidad de presentation).
 */
export const toggleFavoritePersistence = (cca3: string): boolean => {
  const { isNowFavorite } = toggleFavorite(cca3);
  showToast(
    isNowFavorite ? "Added to favorites" : "Removed from favorites",
    isNowFavorite ? "success" : "info",
  );
  return isNowFavorite;
};
