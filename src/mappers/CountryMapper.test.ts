import { describe, it, expect } from "vitest";
import { mapCountry } from "./CountryMapper";

describe("CountryMapper - mapCountry", () => {
  it("debería transformar un pais de la API en un objeto de UI correctamente", () => {
    // 1. Arrange (Organizar): Definir los datos de entrada
    const mockApi = {
      name: { common: "spain" },
      flags: { svg: "spain.svg", png: "spain.png" },
      population: 47000000,
      region: "Europe",
      cca3: "ESP",
      capital: ["Madrid"],
      borders: ["PRT", "FRA"],
    };
    const favorites = ["ESP"];

    // 2. Act (Actuar): Ejecutar la función
    const result = mapCountry(mockApi as any, favorites);

    // 3. Assert (Asegurar): Verificar el resultado
    expect(result.name).toBe("spain");
    expect(result.flag).toBe("spain.svg");
    expect(result.population).toBe(47000000);
    expect(result.region).toBe("Europe");
    expect(result.capital).toBe("Madrid");
    expect(result.cca3).toBe("ESP");
    expect(result.borders).toEqual(["PRT", "FRA"]);
    expect(result.isFavorite).toBe(true);
  });

  it("debería maraca isfavporite como false si el pais no esta en la lista de favoritos", () => {
    // 1. Arrange (Organizar): Definir los datos de entrada
    const mockApi = {
      name: { common: "Japan" },
      cca3: "JPN",
      flags: { svg: "japan.svg", png: "japan.png" },
      population: 0,
      region: "Asia",
      capital: ["Tokyo"],
      borders: ["KOR", "CHN", "RUS"],
    };

    const favorites = ["ESP", "COL", "MEX"];

    // 2. Act (Actuar): Ejecutar la función
    const result = mapCountry(mockApi as any, favorites);

    // 3. Assert (Asegurar): Verificar el resultado
    expect(result.isFavorite).toBe(false);
    expect(result.borders).toEqual(["KOR", "CHN", "RUS"]);
    expect(result.capital).toBe("Tokyo");
  });

  it('debería manejar países sin capital devolviendo "No Capital"', () => {
    // Arrange
    const mockApi = {
      name: { common: "Antarctica" },
      cca3: "ATA",
      flags: {}, // Objeto vacío
      population: 0,
      capital: [], // Array vacío
    };

    // Act
    const result = mapCountry(mockApi as any, []);

    // Assert
    // Probamos lógica de cortocircuito: country.capital?. || "No Capital" [1]
    expect(result.capital).toBe("No Capital");
    expect(result.isFavorite).toBe(false);
    expect(result.borders).toEqual([]);
  });

  it("debería usar la bandera PNG si la SVG no está disponible", () => {
    // Arrange
    const mockApi = {
      name: { common: "Brazil" },
      flags: { png: "brazil.png" }, // No hay campo 'svg'
      population: 211000000,
      cca3: "BRA",
    };

    // Act
    const result = mapCountry(mockApi as any, []);

    // Assert
    expect(result.flag).toBe("brazil.png"); // Verifica el respaldo
  });

  it("debería retornar un array vacío si la propiedad borders no existe en la respuesta", () => {
    // Arrange
    const mockApi = {
      name: { common: "Iceland" },
      flags: { svg: "iceland.svg" },
      population: 366000,
      cca3: "ISL",
      // Nota: No incluimos la propiedad 'borders'
    };

    // Act
    const result = mapCountry(mockApi as any, []);

    // Assert
    expect(result.borders).toEqual([]); // Verifica que el fallback funcione [3]
    expect(Array.isArray(result.borders)).toBe(true);
  });
});
