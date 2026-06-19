/// <reference types="vitest" />
// 🚨 CAMBIAMOS LA IMPORTACIÓN: De 'vite' a 'vitest/config'
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],

  // 🧪 Ahora TypeScript reconocerá perfectamente la propiedad 'test'
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
