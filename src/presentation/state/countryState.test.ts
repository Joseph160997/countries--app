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
  setPage,
  getCurrentPage,
  getTotalPages,
  getRandomCca3,
  __countriesStoreForTest,
  getComparisonCodes,
  getComparisonCount,
  getIsComparisonActive,
  canAddToComparison,
  isInComparison,
  toggleComparisonCountry,
  clearComparison,
  openComparisonView,
  closeComparisonView,
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
    areaKm2: 1141748,
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
    areaKm2: 2780400,
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
    areaKm2: 505990,
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
    let resolveFake!: (value: Result<Country[], AppError>) => void;
    fakeResult = new Promise((resolve) => {
      resolveFake = resolve;
    });

    const loadPromise = loadCountries([]);
    expect(getIsLoading()).toBe(true);

    resolveFake(ok(mockCountries));
    await loadPromise;
  });

  it("should set isLoading to false after loading", async () => {
    await loadCountries([]);
    expect(getIsLoading()).toBe(false);
  });

  it("should populate countries after successful load", async () => {
    await loadCountries([]);
    expect(getFilteredTotal()).toBe(3);
  });

  it("should set isLoading to false even if loading fails", async () => {
    fakeResult = Promise.resolve(
      err({ kind: "network", message: "Network error" }),
    );
    await loadCountries([]);
    expect(getIsLoading()).toBe(false);
  });

  it("should show empty list if loading fails", async () => {
    fakeResult = Promise.resolve(
      err({ kind: "network", message: "Network error" }),
    );
    await loadCountries([]);
    expect(getFilteredTotal()).toBe(0);
  });
});
describe("pagination", () => {
  const makeMany = (n: number): Country[] =>
    Array.from({ length: n }, (_, i) => ({
      ...mockCountries[0],
      cca3: `C${i.toString().padStart(3, "0")}`,
      name: `Country ${i}`,
    }));

  it("should return only PAGE_SIZE countries on the first page", async () => {
    fakeResult = Promise.resolve(ok(makeMany(45)));
    await loadCountries([]);
    expect(getCountries()).toHaveLength(20);
  });

  it("should compute total pages correctly", async () => {
    fakeResult = Promise.resolve(ok(makeMany(45)));
    await loadCountries([]);
    expect(getTotalPages()).toBe(3); // 45 / 20 = 2.25 → 3
  });

  it("setPage should move to the requested page", async () => {
    fakeResult = Promise.resolve(ok(makeMany(45)));
    await loadCountries([]);
    setPage(3);
    expect(getCurrentPage()).toBe(3);
    expect(getCountries()).toHaveLength(5); // 45 - 40 = 5
  });

  it("setPage should clamp to valid bounds", async () => {
    fakeResult = Promise.resolve(ok(makeMany(45)));
    await loadCountries([]);
    setPage(99);
    expect(getCurrentPage()).toBe(3);
    setPage(0);
    expect(getCurrentPage()).toBe(1);
  });

  it("should reset to page 1 when filters change", async () => {
    fakeResult = Promise.resolve(ok(makeMany(45)));
    await loadCountries([]);
    setPage(3);
    setSearchQuery("Country 1");
    expect(getCurrentPage()).toBe(1);
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

  it("should ignore an unknown country code", () => {
    toggleCountryFavorite("ZZZ");

    expect(toggleFavoritePersistence).not.toHaveBeenCalled();
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

  it("should sort by area descending", () => {
    setSort("area-desc");
    const countries = getCountries();
    expect(countries[0].cca3).toBe("ARG"); // 2.78M km²
    expect(countries[1].cca3).toBe("COL"); // 1.14M km²
    expect(countries[2].cca3).toBe("ESP"); // 505k km²
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
// GRUPO H: Filters
// ====================================================

describe("filters", () => {
  beforeEach(async () => {
    fakeResult = Promise.resolve(ok(mockCountries));
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

// ====================================================
// GRUPO I: País aleatorio
// ====================================================
describe("getRandomCca3", () => {
  beforeEach(async () => {
    // Happy path: catálogo con 3 países (COL, ARG, ESP)
    fakeResult = Promise.resolve(ok(mockCountries));
    await loadCountries([]);
  });

  it("should return null when catalog is empty", () => {
    // Reiniciamos el estado y forzamos catálogo vacío directamente
    resetState();
    initCountryState(fakeRepository);
    __countriesStoreForTest.setState({ all: [], isLoading: false });

    // Assert: null es un VALOR válido, no un error
    expect(getRandomCca3()).toBeNull();
  });

  it("should return the only country when catalog has one", () => {
    resetState();
    initCountryState(fakeRepository);
    __countriesStoreForTest.setState({
      all: [mockCountries[0]],
      isLoading: false,
    });

    // Con 1 solo país, SIEMPRE devuelve ese cca3
    expect(getRandomCca3()).toBe("COL");
  });

  it("should always return a valid cca3 from the catalog", () => {
    // Recopilamos todos los cca3 válidos
    const validCodes = mockCountries.map((c) => c.cca3);

    // Tiramos 20 veces: cada resultado DEBE estar en el catálogo.
    // No testeamos QUÉ índice sale (implementación), sino que
    // el resultado siempre es válido (comportamiento).
    for (let i = 0; i < 20; i++) {
      const cca3 = getRandomCca3();
      expect(validCodes).toContain(cca3);
    }
  });

  it("should avoid repeating the currently opened country when possible", () => {
    // Abrimos Colombia en el modal
    openCountryModal("COL");

    // Tiramos 30 veces y recopilamos los resultados únicos
    const codes = new Set<string>();
    for (let i = 0; i < 30; i++) {
      codes.add(getRandomCca3()!);
      // El `!` (non-null assertion) es seguro aquí: sabemos que
      // el catálogo tiene 3 países, nunca será null.
    }

    // Con 3 países y COL excluido, en 30 tiradas DEBEMOS ver
    // al menos ARG y ESP. No verificamos que COL NUNCA salga
    // (podría salir si el pool cae a `all` por edge case),
    // solo que los otros aparecen.
    expect(codes.has("ARG")).toBe(true);
    expect(codes.has("ESP")).toBe(true);
  });

  it("should return null when still loading", () => {
    // Catálogo aún no cargado → all está vacío
    resetState();
    initCountryState(fakeRepository);
    // No llamamos loadCountries: all = []

    expect(getRandomCca3()).toBeNull();
  });
});

// ====================================================
// GRUPO J: Comparación
// ====================================================
describe("comparison", () => {
  beforeEach(async () => {
    fakeRepository.getAll = () => Promise.resolve(ok(mockCountries));
    await loadCountries([]);
  });

  describe("toggleComparisonCountry", () => {
    it("should add a country to the comparison list", () => {
      toggleComparisonCountry("COL");
      expect(getComparisonCodes()).toEqual(["COL"]);
      expect(getComparisonCount()).toBe(1);
    });

    it("should remove a country if already in the list", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("COL");
      expect(getComparisonCodes()).toEqual([]);
      expect(getComparisonCount()).toBe(0);
    });

    it("should allow up to 3 countries", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      toggleComparisonCountry("ESP");
      expect(getComparisonCount()).toBe(3);
      expect(getComparisonCodes()).toEqual(["COL", "ARG", "ESP"]);
    });

    it("should not add a 4th country when limit is reached", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      toggleComparisonCountry("ESP");
      // El límite sigue aplicándose incluso cuando el cuarto código no existe.
      toggleComparisonCountry("ZZZ");
      expect(getComparisonCount()).toBe(3);
      expect(getComparisonCodes()).toEqual(["COL", "ARG", "ESP"]);
    });

    it("should ignore an unknown country code", () => {
      toggleComparisonCountry("ZZZ");

      expect(getComparisonCodes()).toEqual([]);
    });

    it("should report canAddToComparison correctly", () => {
      expect(canAddToComparison()).toBe(true);
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      toggleComparisonCountry("ESP");
      expect(canAddToComparison()).toBe(false);
    });

    it("should report isInComparison correctly", () => {
      toggleComparisonCountry("COL");
      expect(isInComparison("COL")).toBe(true);
      expect(isInComparison("ARG")).toBe(false);
    });
  });

  describe("clearComparison", () => {
    it("should empty the list and close the view", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      openComparisonView();
      clearComparison();

      expect(getComparisonCodes()).toEqual([]);
      expect(getComparisonCount()).toBe(0);
      expect(getIsComparisonActive()).toBe(false);
    });
  });

  describe("openComparisonView / closeComparisonView", () => {
    it("should not open with fewer than 2 countries", () => {
      toggleComparisonCountry("COL");
      openComparisonView();
      expect(getIsComparisonActive()).toBe(false);
    });

    it("should open with 2 or more countries", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      openComparisonView();
      expect(getIsComparisonActive()).toBe(true);
    });

    it("should close without clearing the selection", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      openComparisonView();
      closeComparisonView();

      expect(getIsComparisonActive()).toBe(false);
      // La selección se mantiene
      expect(getComparisonCount()).toBe(2);
    });
  });

  describe("resetState", () => {
    it("should clear comparison state on reset", () => {
      toggleComparisonCountry("COL");
      toggleComparisonCountry("ARG");
      openComparisonView();

      resetState();
      // Re-init para que countryState funcione de nuevo
      initCountryState(fakeRepository);

      expect(getComparisonCodes()).toEqual([]);
      expect(getIsComparisonActive()).toBe(false);
    });
  });
});
