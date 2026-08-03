import {
  loadFavorites,
  saveFavorites,
} from "@/infrastructure/persistence/favorites.store";
import { unwrapOr } from "@/shared/result";

export interface ToggleFavoriteResult {
  cca3: string;
  isNowFavorite: boolean;
}

/**
 * Caso de uso: alternar un país en favoritos.
 * Orquestación pura — lee, alterna, persiste y reporta.
 * El feedback visual (toast) NO es responsabilidad de esta capa.
 */
export const toggleFavorite = (cca3: string): ToggleFavoriteResult => {
  const favorites = unwrapOr(loadFavorites(), []);
  const isFav = favorites.includes(cca3);
  const updated = isFav
    ? favorites.filter((code) => code !== cca3)
    : [...favorites, cca3];

  saveFavorites(updated);
  return { cca3, isNowFavorite: !isFav };
};
