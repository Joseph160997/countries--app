import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FAVS_KEY,
  getFavoriteCodes,
  isCountryFavorite,
  isValidFavList,
  toggleFavoritePersistence,
} from "./favoriteService";

import { storageService } from "../utils/localStorage";
import { showToast } from "../utils/toast";

// ======================================================
// MOCKS
// ======================================================

// Reemplaza completamente el módulo real por funciones falsas.
// Así NO usamos el localStorage real.
vi.mock("../utils/localStorage", () => ({
  storageService: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

// Evita mostrar toasts reales durante las pruebas.
vi.mock("../utils/toast", () => ({
  showToast: vi.fn(),
}));

// ======================================================
// HELPERS
// ======================================================

// Simula lo que devuelve localStorage.
const mockFavorites = (favorites: unknown) => {
  vi.mocked(storageService.get).mockReturnValue(favorites as never);
};

// Verifica qué terminó guardándose.
const expectSavedFavorites = (favorites: string[]) => {
  expect(storageService.save).toHaveBeenCalledWith(FAVS_KEY, favorites);
};

// ======================================================
// TESTS
// ======================================================

describe("favoriteService", () => {
  beforeEach(() => {
    // Limpia todos los mocks antes de cada prueba.
    vi.clearAllMocks();
  });

  // ====================================================
  // isValidFavList
  // ====================================================

  describe("isValidFavList", () => {
    it("should return true when receiving an array of strings", () => {
      // Arrange
      const input = ["COL", "ARG"];

      // Act
      const result = isValidFavList(input);

      // Assert
      expect(result).toBe(true);
    });

    it("should return true for an empty array", () => {
      // Arrange
      const input: string[] = [];

      // Act
      const result = isValidFavList(input);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for null or undefined", () => {
      // Act + Assert
      expect(isValidFavList(null)).toBe(false);
      expect(isValidFavList(undefined)).toBe(false);
    });

    it("should return false when array contains invalid values", () => {
      // Act + Assert
      expect(isValidFavList(["COL", 123])).toBe(false);

      expect(isValidFavList([{ code: "COL" }])).toBe(false);
    });
  });

  // ====================================================
  // getFavoriteCodes
  // ====================================================

  describe("getFavoriteCodes", () => {
    it("should return favorites when storage data is valid", () => {
      // Arrange
      mockFavorites(["COL", "MEX"]);

      // Act
      const result = getFavoriteCodes();

      // Assert
      expect(result).toEqual(["COL", "MEX"]);

      expect(storageService.get).toHaveBeenCalledWith(FAVS_KEY);
    });

    it("should return an empty array when storage data is invalid", () => {
      // Arrange
      mockFavorites("corrupted data");

      // Act
      const result = getFavoriteCodes();

      // Assert
      expect(result).toEqual([]);
    });

    it("should return an empty array when storage is empty", () => {
      // Arrange
      mockFavorites(null);

      // Act
      const result = getFavoriteCodes();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ====================================================
  // isCountryFavorite
  // ====================================================

  describe("isCountryFavorite", () => {
    it("should return true when country exists in favorites", () => {
      // Arrange
      mockFavorites(["COL", "ARG"]);

      // Act
      const result = isCountryFavorite("COL");

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when country does not exist", () => {
      // Arrange
      mockFavorites(["COL", "ARG"]);

      // Act
      const result = isCountryFavorite("MEX");

      // Assert
      expect(result).toBe(false);
    });
  });

  // ====================================================
  // toggleFavoritePersistence
  // ====================================================

  describe("toggleFavoritePersistence", () => {
    it("should add a country when it is not already favorite", () => {
      // Arrange
      mockFavorites(["ARG"]);

      // Act
      const result = toggleFavoritePersistence("COL");

      // Assert
      expect(result).toBe(true);

      expectSavedFavorites(["ARG", "COL"]);

      expect(showToast).toHaveBeenCalledWith("Agregado a favoritos", "success");
    });

    it("should remove a country when it already exists", () => {
      // Arrange
      mockFavorites(["COL", "ARG"]);

      // Act
      const result = toggleFavoritePersistence("COL");

      // Assert
      expect(result).toBe(false);

      expectSavedFavorites(["ARG"]);

      expect(showToast).toHaveBeenCalledWith("Eliminado de favoritos", "info");
    });

    it("should recover from corrupted storage data", () => {
      // Arrange
      mockFavorites("broken data");

      // Act
      toggleFavoritePersistence("COL");

      // Assert
      expectSavedFavorites(["COL"]);
    });
  });
});
