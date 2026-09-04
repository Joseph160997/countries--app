/**
 * Utilidades de Presentación
 * Funciones auxiliares para la capa de presentación.
 */

/**
 * Escapa caracteres HTML peligrosos en strings de usuario.
 * Previene XSS si los datos contienen `<script>` o caracteres especiales.
 *
 * ¿Por qué no usamos DOMPurify? Porque para escapar caracteres básicos
 * como <, >, &, ", ', esta función ligera es suficiente y evita
 * una dependencia externa para un caso de uso específico.
 */
export const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Valida y normaliza URLs antes de inyectarlas en HTML.
 * Acepta solo HTTP(S) o rutas relativas; rechaza javascript:, data: y otros
 * esquemas peligrosos que pudieran ejecutar código al hacer clic o cargar.
 */
export const sanitizeUrl = (value: string | null | undefined): string => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  const normalized = trimmed.replace(/\s+/g, "");

  if (
    normalized === "" ||
    normalized.startsWith("javascript:") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("file:")
  ) {
    return "";
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../") ||
    normalized.startsWith("#") ||
    normalized.startsWith("//")
  ) {
    return normalized;
  }

  return "";
};
