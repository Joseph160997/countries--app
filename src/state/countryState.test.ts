import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  loadCountries,
  setSearchQuery,
  setRegionFilter,
  getCountries,
  resetState,
  subscribe,
} from "./countryState";

import { getAllCountries } from "../services/countryService";
import type { Country } from "../types/Country";

// Reemplaza el servicio real por un mock
vi.mock("../services/countryService", () => ({
  getAllCountries: vi.fn(),
}));

// Datos de prueba controlados
const mockCountries: Country[] = [
  {
    name: "Colombia",
    region: "Americas",
    cca3: "COL",
    population: 50,
    isFavorite: false,
    capital: "Bogotá",
    borders: ["VEN", "BRA", "PER"],
    flag: "colombia.svg",
  },
  {
    name: "Argentina",
    region: "Americas",
    cca3: "ARG",
    population: 45,
    isFavorite: true,
    capital: "Buenos Aires",
    borders: ["BRA", "URU", "PER"],
    flag: "argentina.svg",
  },
  {
    name: "Spain",
    region: "Europe",
    cca3: "ESP",
    population: 47,
    isFavorite: false,
    capital: "Madrid",
    borders: ["PRT", "FRA"],
    flag: "spain.svg",
  },
];

describe("countryState - lógica de filtrado", () => {
  beforeEach(async () => {
    // Reinicia el store
    resetState();

    // Cuando loadCountries llame a getAllCountries,
    // devolveremos nuestros datos falsos
    vi.mocked(getAllCountries).mockResolvedValue(mockCountries);

    // Carga inicial
    await loadCountries([]);
  });

  it("debería mostrar todos los países al iniciar", () => {
    const results = getCountries();

    expect(results).toHaveLength(3);
  });

  it("debería filtrar países por nombre ignorando mayúsculas y minúsculas", () => {
    // Arrange
    setSearchQuery("col");

    // Act
    const results = getCountries();

    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Colombia");
  });

  it("debería filtrar países por región", () => {
    // Arrange
    setRegionFilter("Americas");

    // Act
    const results = getCountries();

    // Assert
    expect(results).toHaveLength(2);
    expect(results.every((country) => country.region === "Americas")).toBe(
      true,
    );
  });

  it("debería combinar búsqueda y región", () => {
    // Arrange
    setSearchQuery("a");
    setRegionFilter("Europe");

    // Act
    const results = getCountries();

    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Spain");
  });

  it("debería devolver todos los países al limpiar filtros", () => {
    // Arrange
    setSearchQuery("zzz");
    setRegionFilter("Africa");

    // Act
    setSearchQuery("");
    setRegionFilter("");

    const results = getCountries();

    // Assert
    expect(results).toHaveLength(mockCountries.length);
  });

  it("debería notificar al cambiar el texto de búsqueda", () => {
    const spy = vi.fn();

    subscribe(spy);
    spy.mockClear();

    setSearchQuery("col");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("debería notificar al cambiar la región", () => {
    const spy = vi.fn();

    subscribe(spy);
    spy.mockClear();

    setRegionFilter("Europe");

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
