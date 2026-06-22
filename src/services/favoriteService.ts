import { storageService } from "../utils/localStorage";
import { showToast } from "../utils/toast";

/** Clave única para World Explorer */
export const FAVS_KEY = "world_explorer_favs";

/**
 * Type Guard: Valida que el dato recuperado sea un array de strings (códigos CCA3).
 * Esto previene errores si el LocalStorage es manipulado externamente. [2]
 */
export const isValidFavList = (data: unknown): data is string[] => {
  return Array.isArray(data) && data.every((item) => typeof item === "string");
};

/**
 * Recupera la lista de códigos de países favoritos.
 * Devuelve siempre un array para que la UI nunca rompa. [3, 4]
 */
export const getFavoriteCodes = (): string[] => {
  const data = storageService.get<string[]>(FAVS_KEY);
  return isValidFavList(data) ? data : [];
};

/**
 * Determina si un país específico es favorito por su código.
 */
export const isCountryFavorite = (cca3: string): boolean => {
  return getFavoriteCodes().includes(cca3);
};

/**
 * Lógica de negocio para agregar/quitar favoritos.
 * Solo guarda los códigos (IDs) para mantener el almacenamiento ligero.
 */
export const toggleFavoritePersistence = (cca3: string): boolean => {
  const favorites = getFavoriteCodes();
  const isFav = favorites.includes(cca3);

  const updatedFavs = isFav
    ? favorites.filter((id) => id !== cca3)
    : [...favorites, cca3];

  storageService.save(FAVS_KEY, updatedFavs);

  // Feedback visual usando tu sistema de Toasts [3, 5]
  showToast(
    isFav ? "Eliminado de favoritos" : "Agregado a favoritos",
    isFav ? "info" : "success",
  );

  return !isFav; // Retorna el nuevo estado para uso inmediato
};
