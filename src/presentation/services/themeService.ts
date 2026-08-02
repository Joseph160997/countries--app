import { storageService } from "@/infrastructure/persistence/localStorage.store";
/**
 * Clave única para World Explorer
 */
const THEME_KEY = "app_theme";

/**
 * @description Función que cambia el tema de la app
 * @param isDark
 * @returns boolean
 */
export const toggleTheme = (): boolean => {
  // 1.
  const htmlElement = document.documentElement;
  const isDark = htmlElement.classList.toggle("dark");

  // Sincronizar data-theme
  const newTheme = htmlElement.classList.contains("dark") ? "dark" : "light";
  htmlElement.setAttribute("data-theme", newTheme);
  document.body.setAttribute("data-theme", newTheme);

  // GUARDAMOS: Guardamos 'dark' o 'light' en el disco local del usuario
  storageService.save(THEME_KEY, isDark ? "dark" : "light");

  return isDark;
};

/**
 * @description Función que inicializa el tema de la app
 */
export const initTheme = (): void => {
  const htmlElement = document.documentElement;

  // 1. Intentamos recuperar lo que el usuario guardó
  const savedTheme = storageService.get<string>(THEME_KEY);

  // 2. Lógica de Decisión:
  // - Si hay algo guardado, usamos eso.
  // - Si NO hay nada (null), preguntamos al navegador por su preferencia de sistema.
  const isDarkPreferred =
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // 3. Aplicación estricta de la clase
  if (isDarkPreferred) {
    htmlElement.classList.add("dark");
  } else {
    htmlElement.classList.remove("dark");
  }

  // Sincronizar data-theme
  const currentTheme = htmlElement.classList.contains("dark")
    ? "dark"
    : "light";
  htmlElement.setAttribute("data-theme", currentTheme);
  document.body.setAttribute("data-theme", currentTheme);
};
