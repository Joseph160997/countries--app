import { initTheme, toggleTheme } from "@/presentation/services/themeService";

/**
 * Controlador de Tema
 * Inicializa el tema y el botón de cambio de tema.
 * @returns void
 */
export const initThemeController = (): void => {
  initTheme();
  document
    .querySelector<HTMLButtonElement>("#theme-toggle")
    ?.addEventListener("click", () => {
      toggleTheme();
    });
};
