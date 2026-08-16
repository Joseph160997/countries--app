import { defineConfig } from "@playwright/test";
import process from "process";
import { config } from "dotenv";

config();

const chromePath = process.env.CHROMIUM_PATH || undefined;

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
 * - CHROMIUM_PATH es opcional: si existe en la máquina local, se usa;
 *   si no existe, Playwright usa su Chromium gestionado. Esto hace que
 *   el proyecto sea portable en CI y en GitHub Actions.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5173/countries--app/",
    headless: true,
    screenshot: "only-on-failure",
    launchOptions: chromePath ? { executablePath: chromePath } : undefined,
  },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
