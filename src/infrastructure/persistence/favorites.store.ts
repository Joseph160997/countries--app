import { storageService } from "./localStorage.store";
import { err, ok, type Result } from "@/shared/result";
import type { AppError } from "@/domain/errors";

export const FAVS_KEY = "world_explorer_favs";

export const isValidFavList = (data: unknown): data is string[] =>
  Array.isArray(data) && data.every((item) => typeof item === "string");

export const loadFavorites = (): Result<string[], AppError> => {
  const data = storageService.get<unknown>(FAVS_KEY);
  if (data === null) return ok([]);
  if (isValidFavList(data)) return ok(data);
  return err({
    kind: "storage",
    message: `Favorites data is corrupt: ${JSON.stringify(data)}`,
  });
};

export const saveFavorites = (codes: string[]): void => {
  storageService.save(FAVS_KEY, codes);
};
