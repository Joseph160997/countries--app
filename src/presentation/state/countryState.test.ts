import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Country } from "@/domain/country";
import type { CountryRepository } from "@/domain/ports/country.repository";
import type { AppError } from "@/domain/errors";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";

// ======================================================
// FAKE REPOSITORY — test double que implementa el puerto.
// Sin vi.mock, sin magia de módulos: un objeto y una promesa.
// ======================================================
let fakeResult: Promise<Result<Country[], AppError>> = Promise.resolve(ok([]));

const fakeRepository: CountryRepository = {
  getAll: () => fakeResult,
};

vi.mock("@/presentation/services/favoriteService", () => ({
  toggleFavoritePersistence: vi.fn(),
}));
vi.mock("@/infrastructure/persistence/localStorage.store", () => ({
  storageService: { get: vi.fn(), save: vi.fn() },
}));

// Importamos DESPUÉS de los mocks, para que sean reemplazados.
import {
  loadCountries,
  getCountries,
  getIsLoading,
  getFilteredTotal,
  hasMore,
  loadMore,
  setSearchQuery,
  setRegionFilter,
  toggleShowFavorites,
  toggleCountryFavorite,
  setSort,
  getSort,
  openCountryModal,
  closeCountryModal,
  getSelectedCountry,
  getBorderNames,
  subscribe,
  resetState,
  initCountryState,
} from "./countryState";

import { toggleFavoritePersistence } from "@/presentation/services/favoriteService";
// FIXTURE

const mockCountries: Country[] = [
  {
    cca3: "COL",
    name: "Colombia",
    flag: "colombia.svg",
    flagAlt: "Bandera de Colombia",
    population: 51000000,
    region: "Americas",
    capital: "Bogotá",
    isFavorite: false,
    subregion: "South America",
    borders: ["VEN", "PAN"],
    languages: ["Spanish"],
    currencies: ["Colombian Peso ($)"],
    tld: [".co"],
  },
  {
    cca3: "ARG",
    name: "Argentina",
    flag: "argentina.svg",
    flagAlt: "Bandera de Argentina",
    population: 45000000,
    region: "Americas",
    capital: "Buenos Aires",
    isFavorite: true,
    subregion: "South America",
    borders: ["CHI", "BOL"],
    languages: ["Spanish"],
    currencies: ["Argentine Peso ($)"],
    tld: [".ar"],
  },
  {
    cca3: "ESP",
    name: "Spain",
    flag: "spain.svg",
    flagAlt: "Bandera de España",
    population: 47000000,
    region: "Europe",
    capital: "Madrid",
    isFavorite: false,
    subregion: "Southern Europe",
    borders: ["FRA", "PRT"],
    languages: ["Spanish"],
    currencies: ["Euro (€)"],
    tld: [".es"],
  },
];

// TESTS

beforeEach(() => {
  resetState();
  vi.clearAllMocks();
  initCountryState(fakeRepository);
  fakeResult = Promise.resolve(ok(mockCountries)); // happy path por defecto
});
// ====================================================
// GRUPO A: Carga de datos
// ====================================================
describe("loadCountries", () => {
  it("should set isLoading to true while loading", async () => {
    // Arrange — hacemos que getAllCountries tarde un poco
    // para poder capturar el estado intermedio
    let resolvePromise: (value: Country[]) => void;
    const pendingPromise = new Promise<Country[]>((resolve) => {
      resolvePromise = resolve;
    });
    fakeResult = pendingPromise.then((countries) => ok(countries));

    // Act — iniciamos la carga sin await (para capturar el estado intermedio)
    const loadPromise = loadCountries([]);

    // Assert — mientras carga, isLoading debe ser true
    expect(getIsLoading()).toBe(true);

    // Resolvemos la promesa para que no quede pendiente
    resolvePromise!(mockCountries);
    await loadPromise;
  });

  it("should set isLoading to false after loading", async () => {
    // Arrange
    fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));

    // Act
    await loadCountries([]);

    // Assert
    expect(getIsLoading()).toBe(false);
  });

  it("should populate countries after successful load", async () => {
    // Arrange
    fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));

    // Act
    await loadCountries([]);

    // Assert
    expect(getFilteredTotal()).toBe(3);
  });

  it("should set isLoading to true while loading", async () => {
    let resolveFake!: (value: Result<Country[], AppError>) => void;
    fakeResult = new Promise((resolve) => {
      resolveFake = resolve;
    });

    const loadPromise = loadCountries([]);
    expect(getIsLoading()).toBe(true);

    resolveFake(ok(mockCountries));
    await loadPromise;
  });

  it("should set isLoading to false even if loading fails", async () => {
    // Ya no se rechaza una promesa: se RESUELVE con un error tipado
    fakeResult = Promise.resolve(
      err({ kind: "network", message: "Network error" }),
    );
    await loadCountries([]);
    expect(getIsLoading()).toBe(false);
  });

  // ====================================================
  // GRUPO B: Filtros
  // ====================================================
  describe("filters", () => {
    beforeEach(async () => {
      // Cargamos los países una vez para todos los tests de filtros
      fakeRepository.getAll = () => fakeResult;
      await loadCountries([]);
    });

    describe("setSearchQuery", () => {
      it("should filter countries by name", () => {
        setSearchQuery("colombia");
        expect(getFilteredTotal()).toBe(1);
        expect(getCountries()[0].name).toBe("Colombia");
      });

      it("should return all countries when query is empty", () => {
        setSearchQuery("colombia");
        setSearchQuery("");
        expect(getFilteredTotal()).toBe(3);
      });

      it("should be case insensitive", () => {
        setSearchQuery("SPAIN");
        expect(getFilteredTotal()).toBe(1);
        expect(getCountries()[0].name).toBe("Spain");
      });

      it("should return empty when no match found", () => {
        setSearchQuery("zzzzz");
        expect(getFilteredTotal()).toBe(0);
      });
    });

    describe("setRegionFilter", () => {
      it("should filter countries by region", () => {
        setRegionFilter("Europe");
        expect(getFilteredTotal()).toBe(1);
        expect(getCountries()[0].name).toBe("Spain");
      });

      it("should return all countries when region is empty", () => {
        setRegionFilter("Europe");
        setRegionFilter("");
        expect(getFilteredTotal()).toBe(3);
      });

      it("should return empty when no countries match region", () => {
        setRegionFilter("Africa");
        expect(getFilteredTotal()).toBe(0);
      });
    });

    describe("toggleShowFavorites", () => {
      it("should show only favorites when active", () => {
        toggleShowFavorites();
        // Solo ARG tiene isFavorite: true en el fixture
        expect(getFilteredTotal()).toBe(1);
        expect(getCountries()[0].cca3).toBe("ARG");
      });

      it("should show all countries when toggled back", () => {
        toggleShowFavorites();
        toggleShowFavorites();
        expect(getFilteredTotal()).toBe(3);
      });
    });
  });

  // ====================================================
  // GRUPO C: Paginación
  // ====================================================
  describe("pagination", () => {
    it("should return only visibleCount countries", async () => {
      // Creamos 25 países falsos para superar el límite de 20
      const manyCountries: Country[] = Array.from({ length: 25 }, (_, i) => ({
        ...mockCountries[0],
        cca3: `C${i.toString().padStart(2, "0")}`,
        name: `Country ${i}`,
      }));

      fakeRepository.getAll = () => Promise.resolve(ok(manyCountries));
      await loadCountries([]);

      // Assert — solo muestra 20 aunque haya 25
      expect(getCountries()).toHaveLength(20);
    });

    it("hasMore should return true when there are more countries", async () => {
      const manyCountries: Country[] = Array.from({ length: 25 }, (_, i) => ({
        ...mockCountries[0],
        cca3: `C${i.toString().padStart(2, "0")}`,
        name: `Country ${i}`,
      }));

      fakeRepository.getAll = () => Promise.resolve(ok(manyCountries));
      await loadCountries([]);

      expect(hasMore()).toBe(true);
    });

    it("hasMore should return false when all countries are visible", async () => {
      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);

      // Solo 3 países — todos visibles
      expect(hasMore()).toBe(false);
    });

    it("loadMore should increase visible count by 20", async () => {
      const manyCountries: Country[] = Array.from({ length: 45 }, (_, i) => ({
        ...mockCountries[0],
        cca3: `C${i.toString().padStart(2, "0")}`,
        name: `Country ${i}`,
      }));

      fakeRepository.getAll = () => Promise.resolve(ok(manyCountries));
      await loadCountries([]);

      // Primero vemos 20
      expect(getCountries()).toHaveLength(20);

      // Después de loadMore vemos 40
      loadMore();
      expect(getCountries()).toHaveLength(40);
    });
  });

  // ====================================================
  // GRUPO D: Modal
  // ====================================================
  describe("modal", () => {
    beforeEach(async () => {
      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);
    });

    it("should set selectedCountry when opening modal", () => {
      openCountryModal("COL");
      expect(getSelectedCountry()?.cca3).toBe("COL");
    });

    it("should clear selectedCountry when closing modal", () => {
      openCountryModal("COL");
      closeCountryModal();
      expect(getSelectedCountry()).toBeNull();
    });

    it("should not set selectedCountry for unknown cca3", () => {
      openCountryModal("ZZZ");
      expect(getSelectedCountry()).toBeNull();
    });
  });

  // ====================================================
  // GRUPO E: Favoritos
  // ====================================================
  describe("toggleCountryFavorite", () => {
    beforeEach(async () => {
      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);
    });

    it("should toggle isFavorite to true", () => {
      vi.mocked(toggleFavoritePersistence).mockReturnValue(true);

      toggleCountryFavorite("COL");

      const col = getCountries().find((c) => c.cca3 === "COL");
      expect(col?.isFavorite).toBe(true);
    });

    it("should toggle isFavorite to false", () => {
      vi.mocked(toggleFavoritePersistence).mockReturnValue(false);

      toggleCountryFavorite("ARG");

      // ARG no aparece en el slice visible porque está fuera del filtro
      // buscamos en todos usando getBorderNames como proxy — mejor abrir modal
      openCountryModal("ARG");
      expect(getSelectedCountry()?.isFavorite).toBe(false);
    });
  });

  // ====================================================
  // GRUPO F: Sort
  // ====================================================
  describe("setSort", () => {
    beforeEach(async () => {
      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);
    });

    it("should sort by population descending", () => {
      setSort("population-desc");
      const countries = getCountries();
      expect(countries[0].cca3).toBe("COL"); // 51M
      expect(countries[1].cca3).toBe("ESP"); // 47M
      expect(countries[2].cca3).toBe("ARG"); // 45M
    });

    it("should sort by name ascending", () => {
      setSort("name-asc");
      const countries = getCountries();
      expect(countries[0].name).toBe("Argentina");
      expect(countries[1].name).toBe("Colombia");
      expect(countries[2].name).toBe("Spain");
    });

    it("should update currentSort", () => {
      setSort("name-asc");
      expect(getSort()).toBe("name-asc");
    });
  });

  // ====================================================
  // GRUPO G: getBorderNames
  // ====================================================
  describe("getBorderNames", () => {
    beforeEach(async () => {
      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);
    });

    it("should translate cca3 codes to country names", () => {
      const names = getBorderNames(["COL", "ARG"]);
      expect(names).toEqual(["Colombia", "Argentina"]);
    });

    it("should return the code as fallback when country not found", () => {
      const names = getBorderNames(["ZZZ"]);
      expect(names).toEqual(["ZZZ"]);
    });

    it("should return empty array for empty input", () => {
      const names = getBorderNames([]);
      expect(names).toEqual([]);
    });
  });

  // ====================================================
  // GRUPO H: subscribe
  // ====================================================
  describe("subscribe", () => {
    it("should call listener when state changes", async () => {
      const listener = vi.fn();
      subscribe(listener);

      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);

      // notify() se llama varias veces durante loadCountries
      expect(listener).toHaveBeenCalled();
    });

    it("should stop calling listener after unsubscribe", async () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      unsubscribe();
      listener.mockClear();

      fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
      await loadCountries([]);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
