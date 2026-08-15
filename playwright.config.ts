import { defineConfig } from "@playwright/test";

/**
 * Configuración de Playwright para tests e2e.
 *
 * Decisiones:
 * - testDir: los tests viven en /e2e, fuera de /src. Playwright
 *   no necesita acceder al código fuente, solo a la app corriendo.
 * - baseURL: incluye /countries--app/ porque vite.config.ts tiene
 *   base: "/countries--app/". Sin esto, Playwright navegaría a la
 *   raíz y encontraría un 404.
 * - webServer: Playwright arranca `npm run dev` automáticamente
 *   antes de los tests y lo mata al terminar. Un solo comando.
 * - reuseExistingServer: si ya tienes `npm run dev` corriendo en
 *   otra terminal, Playwright lo reutiliza en vez de fallar.
 * - timeout: 30s por test. La API de REST Countries puede tardar
 *   3-5 segundos en responder. Con 5 tests, 30s es holgado.
 * - Solo Chromium: no necesitamos Firefox ni WebKit para portafolio.
 * - launchOptions.executablePath: apunta directamente al ejecutable de Chrome
 *   descomprimido en el Escritorio.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5173/countries--app/",
    headless: true,
    screenshot: "only-on-failure",
    /* Especificamos la ruta del ejecutable de Chrome en el Escritorio */
    launchOptions: {
      executablePath: "C:/Users/USER/Desktop/chrome-win64/chrome.exe",
    },
  },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
