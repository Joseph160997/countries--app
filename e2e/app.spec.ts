import { test, expect } from "@playwright/test";

/**
 * Test 1: Carga inicial.
 *
 * Verifica el "happy path" más básico: la app carga, la API
 * responde, el grid muestra países y el hero se renderiza.
 *
 * Este test usa la API REAL de REST Countries. No hay mocking.
 * Si la API está caída, este test falla. Es un trade-off
 * consciente documentado en el README.
 *
 * Decisiones:
 * - waitForSelector con timeout de 15s: la API puede tardar
 *   3-5s en responder. 15s da margen sin ser excesivo.
 * - Verificamos .country-card (clase del componente), no un
 *   texto específico. Los textos pueden cambiar con i18n en
 *   el futuro; las clases estructurales son más estables.
 * - count() > 0 en vez de toBe(20): el número exacto depende
 *   de la paginación y del estado de la API. Verificar que
 *   hay AL MENOS una card es suficiente para confirmar carga.
 */
test("should load the app and display countries in the grid", async ({
  page,
}) => {
  // Navegar a la app. page.goto("/") usa el baseURL del config,
  // así que realmente va a http://localhost:5173/countries--app/
  await page.goto("/");

  // Esperar a que aparezca al menos una card en el grid.
  // Este es el "punto de estabilización": si la API respondió
  // y el renderer pintó, la app está lista.
  await page.waitForSelector(".country-card", { timeout: 15_000 });

  // Verificar que hay cards visibles
  const cardCount = await page.locator(".country-card").count();
  expect(cardCount).toBeGreaterThan(0);

  // Verificar que el hero se renderizó (no está vacío)
  const heroSlides = page.locator("#hero-container .hero-slide");
  await expect(heroSlides.first()).toBeVisible({ timeout: 10_000 });
});
