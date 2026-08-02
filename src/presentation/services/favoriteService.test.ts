import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/persistence/localStorage.store", () => ({
  storageService: { get: vi.fn(), save: vi.fn() },
}));
vi.mock("./toast", () => ({
  showToast: vi.fn(),
}));

import {
  FAVS_KEY,
  getFavoriteCodes,
  isCountryFavorite,
  isValidFavList,
  toggleFavoritePersistence,
} from "./favoriteService";
import { storageService } from "@/infrastructure/persistence/localStorage.store";
import { showToast } from "./toast";
// HELPERS

const mockFavorites = (favorites: unknown) => {
  vi.mocked(storageService.get).mockReturnValue(favorites as never);
};

const expectSavedFavorites = (favorites: string[]) => {
  expect(storageService.save).toHaveBeenCalledWith(FAVS_KEY, favorites);
};

// TESTS

describe("favoriteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // isValidFavList
  describe("isValidFavList", () => {
    it("should return true when receiving an array of strings", () => {
      expect(isValidFavList(["COL", "ARG"])).toBe(true);
    });

    it("should return true for an empty array", () => {
      expect(isValidFavList([])).toBe(true);
    });

    it("should return false for null or undefined", () => {
      expect(isValidFavList(null)).toBe(false);
      expect(isValidFavList(undefined)).toBe(false);
    });

    it("should return false when array contains invalid values", () => {
      expect(isValidFavList(["COL", 123])).toBe(false);
      expect(isValidFavList([{ code: "COL" }])).toBe(false);
    });
  });

  // ====================================================
  // getFavoriteCodes ← AQUÍ ESTÁN LOS 3 CAMBIOS
  // ====================================================
  describe("getFavoriteCodes", () => {
    it("should return ok with favorites when storage data is valid", () => {
      // Arrange
      mockFavorites(["COL", "MEX"]);

      // Act
      const result = getFavoriteCodes();

      // Assert — ahora es un Result, no un array plano
      expect(result).toEqual({ ok: true, value: ["COL", "MEX"] });
      expect(storageService.get).toHaveBeenCalledWith(FAVS_KEY);
    });

    it("should return a storage error when data is corrupt", () => {
      // Arrange — este test CAMBIÓ DE SIGNIFICADO:
      // antes esperaba [] silencioso, ahora el fallo EXISTE
      mockFavorites("corrupted data");

      // Act
      const result = getFavoriteCodes();

      // Assert
      expect(result).toEqual({
        ok: false,
        error: {
          kind: "storage",
          message: expect.stringContaining("corrupt"),
        },
      });
    });

    it("should return ok with empty array when storage is empty", () => {
      // Arrange
      mockFavorites(null);

      // Act
      const result = getFavoriteCodes();

      // Assert — "no hay favoritos" es un estado VÁLIDO, no un error
      expect(result).toEqual({ ok: true, value: [] });
    });
  });

  // ====================================================
  // isCountryFavorite (sin cambios — usa unwrapOr internamente)
  // ====================================================
  describe("isCountryFavorite", () => {
    it("should return true when country exists in favorites", () => {
      mockFavorites(["COL", "ARG"]);
      expect(isCountryFavorite("COL")).toBe(true);
    });

    it("should return false when country does not exist", () => {
      mockFavorites(["COL", "ARG"]);
      expect(isCountryFavorite("MEX")).toBe(false);
    });
  });

  // ====================================================
  // toggleFavoritePersistence (toasts en inglés desde Fase 0)
  // ====================================================
  describe("toggleFavoritePersistence", () => {
    it("should add a country when it is not already favorite", () => {
      mockFavorites(["ARG"]);

      const result = toggleFavoritePersistence("COL");

      expect(result).toBe(true);
      expectSavedFavorites(["ARG", "COL"]);
      expect(showToast).toHaveBeenCalledWith("Added to favorites", "success");
    });

    it("should remove a country when it already exists", () => {
      mockFavorites(["COL", "ARG"]);

      const result = toggleFavoritePersistence("COL");

      expect(result).toBe(false);
      expectSavedFavorites(["ARG"]);
      expect(showToast).toHaveBeenCalledWith("Removed from favorites", "info");
    });

    it("should recover from corrupted storage data", () => {
      // Arrange — datos corruptos → unwrapOr cae a []
      mockFavorites("broken data");

      // Act
      toggleFavoritePersistence("COL");

      // Assert — arranca desde lista vacía y agrega
      expectSavedFavorites(["COL"]);
    });
  });
});
