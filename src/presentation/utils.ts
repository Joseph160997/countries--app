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
