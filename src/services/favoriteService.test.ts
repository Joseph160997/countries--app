import { describe, it, expect } from "vitest";
// Nota: Para este ejemplo asumimos que exportas isValidFavList o pruebas una lógica similar
const isValidFavList = (data: any) =>
  Array.isArray(data) && data.every((i) => typeof i === "string");

describe("favoriteService - isValidFavList", () => {
  it("debería retornar true si recibe un array de strings", () => {
    // 1. Arrange (Organizar)
    const dataPrueba = ["COL", "ARG", "MEX"];

    // 2. Act (Actuar)
    const resultado = isValidFavList(dataPrueba);

    // 3. Assert (Asegurar)
    expect(resultado).toBe(true);
  });

  it("debería retornar false si el array contiene números", () => {
    // Arrange
    const dataInvalida = ["COL", 123];

    // Act
    const resultado = isValidFavList(dataInvalida);

    // Assert
    expect(resultado).toBe(false);
  });
});
