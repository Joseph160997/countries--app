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

/**
 * Test 2: Command Palette → Modal → Hash Routing.
 *
 * Verifica el flujo completo de búsqueda con teclado:
 * 1. Ctrl+K abre el palette
 * 2. Escribir filtra resultados
 * 3. Enter selecciona y abre el modal
 * 4. La URL se actualiza con el hash del país
 *
 * Este test cubre 3 features de Fase 5 en un solo flujo:
 * Command Palette, Modal de detalle y Hash Routing.
 *
 * Decisiones:
 * - Usamos page.keyboard.press("Control+k") porque el palette
 *   se abre con atajo de teclado, no con click. Playwright
 *   simula la combinación exactamente como un usuario real.
 * - Escribimos con page.keyboard.type() en vez de
 *   page.fill() porque el palette tiene un listener de
 *   evento 'input' en cada tecla, no un listener de 'change'.
 *   fill() dispara 'change', type() dispara 'input' por letra.
 * - Verificamos la URL con page.url() para confirmar que
 *   el hash routing funcionó. Sin esto, el modal podría
 *   abrirse pero la URL no cambiaría (bug silencioso).
 */
test("should open a country modal via Command Palette and update URL hash", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector(".country-card", { timeout: 15_000 });

  // 1. Abrir el Command Palette con Ctrl+K
  await page.keyboard.press("Control+k");

  // 2. Esperar a que el overlay del palette aparezca
  await page.waitForSelector("#command-palette-overlay", { timeout: 5_000 });

  // 3. Escribir una búsqueda
  // Usamos type() en vez de fill() porque el palette escucha
  // el evento 'input' en cada tecla, no 'change' al final.
  await page.locator("#palette-input").pressSequentially("colombia", {
    delay: 50,
  });

  // 4. Esperar a que aparezcan resultados
  await page.waitForSelector(".palette-item", { timeout: 5_000 });

  // 5. Presionar Enter para seleccionar el primer resultado
  await page.keyboard.press("Enter");

  // 6. Verificar que el modal se abrió
  await page.waitForSelector("#modal-container:not(.hidden)", {
    timeout: 5_000,
  });

  // 7. Verificar que el modal muestra datos del país
  const modalText = await page.locator("#modal-container").textContent();
  expect(modalText).toContain("Colombia");

  // 8. Verificar que la URL tiene el hash del país
  // Esto confirma que el hash routing funcionó correctamente.
  expect(page.url()).toContain("#/country/COL");
});

/**
 * Test 3: Modo Comparación.
 *
 * Verifica el flujo completo de comparación:
 * 1. Click en ⚖️ de dos países
 * 2. La barra flotante aparece con "Compare"
 * 3. Click en "Compare" abre el overlay
 * 4. El overlay muestra ambos países
 *
 * Decisiones:
 * - Usamos .btn-compare[data-id="XXX"] para seleccionar el
 *   botón de un país específico. Los botones de comparación
 *   tienen data-id con el cca3, igual que los de favoritos.
 * - Esperamos a que la barra flotante aparezca antes de
 *   hacer click en "Compare". La barra solo existe cuando
 *   hay países seleccionados.
 * - Verificamos el texto del overlay con toContain() para
 *   confirmar que los países están presentes. No verificamos
 *   estructura HTML porque eso es frágil ante cambios de layout.
 */
test("should compare two countries side by side", async ({ page }) => {
  await page.goto("/");

  // Esperar a que las cards estén renderizadas
  await page.waitForSelector('.country-card[data-id]:not([data-id=""])', {
    timeout: 15_000,
  });

  // Obtener dos tarjetas válidas con data-id real.
  const validCards = page.locator('.country-card[data-id]:not([data-id=""])');
  await expect
    .poll(async () => await validCards.count(), { timeout: 10_000 })
    .toBeGreaterThan(1);

  const firstCardId = await validCards.first().getAttribute("data-id");
  const secondCardId = await validCards.nth(1).getAttribute("data-id");

  expect(firstCardId).toBeTruthy();
  expect(secondCardId).toBeTruthy();

  // Click en el botón de comparar de la primera card
  // Esperar a que el botón exista antes de hacer click
  const firstCompareBtn = page.locator(
    `.btn-compare[data-id="${firstCardId}"]`,
  );
  await firstCompareBtn.waitFor({ state: "visible", timeout: 5_000 });
  await firstCompareBtn.click();

  // Verificar que la barra apareció después del primer click
  await page.waitForSelector("#comparison-bar", { timeout: 5_000 });

  // Click en el botón de comparar de la segunda card
  const secondCompareBtn = page.locator(
    `.btn-compare[data-id="${secondCardId}"]`,
  );
  await secondCompareBtn.waitFor({ state: "visible", timeout: 5_000 });
  await secondCompareBtn.click();

  // Esperar a que el botón "Compare" esté habilitado (canCompare = true)
  await page.waitForSelector("#btn-open-comparison", { timeout: 5_000 });

  // Click en "Compare"
  await page.locator("#btn-open-comparison").click();

  // Verificar que el overlay de comparación se abrió
  await page.waitForSelector("#comparison-overlay", { timeout: 5_000 });

  // Verificar que el overlay muestra el título
  const overlayText = await page.locator("#comparison-overlay").textContent();
  expect(overlayText).toContain("Compare Countries");
  expect(overlayText).toContain("2/3");
});

/**
 * Test 4: Favoritos.
 *
 * Verifica el flujo de favoritos:
 * 1. El contador inicial es 0
 * 2. Click en ❤️ de una card
 * 3. El contador sube a 1
 * 4. El botón cambia a ❤️ lleno
 *
 * Decisiones:
 * - Verificamos el contador ANTES y DESPUÉS del click.
 *   Solo verificar "después" no confirma que el click
 *   causó el cambio. Verificar ambos estados sí.
 * - Usamos textContent() del contador porque es un <span>
 *   con un número. No necesitamos parsear ni validar formato.
 * - Limpiamos localStorage al inicio para garantizar que
 *   el test arranca con 0 favoritos. Sin esto, si un test
 *   anterior dejó favoritos, el contador empezaría en otro número.
 */
test("should toggle a country as favorite and update the counter", async ({
  page,
}) => {
  // Limpiar localStorage E IndexedDB para garantizar un estado limpio
  await page.goto("/");
  await page.evaluate(async () => {
    localStorage.clear();
    const dbs = await indexedDB.databases();
    await Promise.all(
      dbs.map(
        (db) =>
          new Promise<void>((resolve, reject) => {
            if (!db.name) return resolve();
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          }),
      ),
    );
  });
  await page.reload();

  // Esperar a que las cards estén renderizadas
  await page.waitForSelector('.country-card[data-id]:not([data-id=""])', {
    timeout: 15_000,
  });

  // Verificar que el contador empieza en 0
  const counterBefore = await page.locator("#favs-count-display").textContent();
  expect(counterBefore?.trim()).toBe("0");

  // Obtener el data-id de la primera tarjeta válida.
  const validCards = page.locator('.country-card[data-id]:not([data-id=""])');
  await expect
    .poll(async () => await validCards.count(), { timeout: 10_000 })
    .toBeGreaterThan(0);

  const firstCardId = await validCards.first().getAttribute("data-id");
  expect(firstCardId).toBeTruthy();

  // Esperar a que el botón de favoritos exista antes de hacer click
  const favButton = page.locator(`.btn-fav[data-id="${firstCardId}"]`);
  await favButton.waitFor({ state: "visible", timeout: 5_000 });

  // Click en el botón de favoritos
  await favButton.click();

  // El toast se crea inmediatamente, así que solo verificamos que existe
  await page.waitForSelector("#toast-container", { timeout: 5_000 });

  // Verificar que hay al menos un toast dentro del contenedor
  const toasts = page.locator("#toast-container > div");
  await expect(toasts.first()).toBeVisible({ timeout: 5_000 });

  // Verificar que el contador subió a 1
  const counterAfter = await page.locator("#favs-count-display").textContent();
  expect(counterAfter?.trim()).toBe("1");

  // Verificar que el botón cambió a ❤️
  await expect(favButton).toContainText("❤️");
});

/**
 * Test 5: Toggle de tema.
 *
 * Verifica el flujo de cambio de tema:
 * 1. Detectar el estado inicial (light o dark)
 * 2. Click en el botón de tema
 * 3. Verificar que la clase cambió
 *
 * Decisiones:
 * - No asumimos que el tema inicial es "light". El usuario
 *   puede tener preferencia de sistema oscura. Detectamos
 *   el estado actual y verificamos que cambió al opuesto.
 * - Usamos evaluate() para leer classList de <html> porque
 *   Playwright no tiene un método directo para verificar
 *   clases de un elemento. evaluate() ejecuta JS en el contexto
 *   de la página.
 * - Verificamos tanto <html> como <body> porque themeService
 *   actualiza ambos con data-theme. Verificar solo uno
 *   podría dejar pasar un bug donde solo se actualiza uno.
 */
test("should toggle between light and dark theme", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".country-card", { timeout: 15_000 });

  // 1. Detectar el estado inicial del tema
  // No asumimos light o dark: el usuario puede tener
  // preferencia de sistema oscura.
  const isDarkBefore = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );

  // 2. Click en el botón de tema
  await page.locator("#theme-toggle").click();

  // 3. Verificar que el tema cambió al opuesto
  const isDarkAfter = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );

  expect(isDarkAfter).toBe(!isDarkBefore);

  // 4. Verificar que data-theme se actualizó en <html> y <body>
  const htmlTheme = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  const bodyTheme = await page.evaluate(() =>
    document.body.getAttribute("data-theme"),
  );

  const expectedTheme = isDarkBefore ? "light" : "dark";
  expect(htmlTheme).toBe(expectedTheme);
  expect(bodyTheme).toBe(expectedTheme);
});
