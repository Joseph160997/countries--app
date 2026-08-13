import type { Country } from "@/domain/country";

/**
 * Componente del Command Palette.
 *
 * Es un componente "tonto": recibe datos ya procesados y devuelve HTML.
 * No sabe buscar, no sabe navegar, no sabe abrir modales.
 * El controller le dice QUÉ mostrar; él solo lo renderiza.
 *
 * Decisiones de diseño:
 * - `role="dialog"` + `aria-modal`: accesibilidad. Es un diálogo modal.
 * - `role="listbox"` en la lista: los screen readers anuncian
 *   "lista de opciones" en vez de "lista genérica".
 * - `aria-selected` en cada item: el screen reader sabe cuál está
 *   resaltado por las flechas del teclado.
 * - El input tiene `role="combobox"`: es un campo de búsqueda
 *   con sugerencias dinámicas.
 */

export interface PaletteRenderData {
  readonly query: string;
  readonly results: readonly Country[];
  readonly selectedIndex: number;
  readonly isLoading: boolean;
}

/**
 * Genera el HTML completo del overlay del Command Palette.
 * Se llama una vez al abrir. Las actualizaciones posteriores
 * solo re-renderizan la lista (ver controller).
 */
export const renderCommandPalette = (data: PaletteRenderData): string => {
  const { query, results, selectedIndex, isLoading } = data;

  const resultsHTML = isLoading
    ? `<div class="px-4 py-8 text-center text-sm text-ink-faint dark:text-starlight-faint">Loading countries…</div>`
    : results.length === 0 && query.length > 0
      ? `<div class="px-4 py-8 text-center text-sm text-ink-faint dark:text-starlight-faint">No countries found for "${escapeHtml(query)}"</div>`
      : results
          .map((country, index) =>
            renderPaletteItem(country, index === selectedIndex),
          )
          .join("");

  return `
<div id="command-palette-overlay" class="fixed inset-0 z-60 flex items-start justify-center pt-[15vh] bg-ink/40 dark:bg-space-deep/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Country search">
  <div class="w-full max-w-lg mx-4 bg-paper-card dark:bg-space-card rounded-2xl shadow-2xl border border-slate-200/60 dark:border-starlight-faint/15 overflow-hidden animate-fade-in-up">

    <!-- Input de búsqueda -->
    <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/60 dark:border-starlight-faint/10">
      <span class="text-lg text-ink-faint dark:text-starlight-faint shrink-0">🔎</span>
      <input
        id="palette-input"
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-results"
        aria-autocomplete="list"
        placeholder="Search countries…"
        autocomplete="off"
        spellcheck="false"
        class="w-full bg-transparent text-base text-ink dark:text-starlight placeholder-ink-faint dark:placeholder-starlight-faint outline-none font-medium"
        value="${escapeHtml(query)}"
      />
      <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-paper-deep dark:bg-space-deep text-[10px] font-mono font-bold text-ink-faint dark:text-starlight-faint border border-slate-200/60 dark:border-starlight-faint/10 shrink-0">ESC</kbd>
    </div>

    <!-- Lista de resultados -->
    <ul id="palette-results" role="listbox" aria-label="Search results" class="max-h-72 overflow-y-auto py-1">
      ${resultsHTML}
    </ul>

    <!-- Footer con hints de teclado -->
    <div class="flex items-center justify-between px-4 py-2.5 border-t border-slate-200/60 dark:border-starlight-faint/10 bg-paper-deep/50 dark:bg-space-deep/50">
      <div class="flex items-center gap-3 text-[10px] font-mono text-ink-faint dark:text-starlight-faint">
        <span><kbd class="px-1 py-0.5 rounded bg-paper-card dark:bg-space-card border border-slate-200/60 dark:border-starlight-faint/10">↑↓</kbd> navigate</span>
        <span><kbd class="px-1 py-0.5 rounded bg-paper-card dark:bg-space-card border border-slate-200/60 dark:border-starlight-faint/10">↵</kbd> open</span>
        <span><kbd class="px-1 py-0.5 rounded bg-paper-card dark:bg-space-card border border-slate-200/60 dark:border-starlight-faint/10">esc</kbd> close</span>
      </div>
      <span class="text-[10px] font-mono text-ink-faint dark:text-starlight-faint">${results.length} result${results.length !== 1 ? "s" : ""}</span>
    </div>

  </div>
</div>
  `;
};

/**
 * Renderiza un item individual de la lista de resultados.
 *
 * `data-cca3` permite al controller identificar qué país se clickeó
 * sin tener que buscar por índice en el array.
 *
 * `aria-selected` + `data-selected` mantienen el estado visual
 * y de accesibilidad sincronizados.
 */
const renderPaletteItem = (country: Country, isSelected: boolean): string => `
<li
  role="option"
  aria-selected="${isSelected}"
  data-cca3="${country.cca3}"
  class="palette-item flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
    ${
      isSelected
        ? "bg-accent/10 dark:bg-gold/10 text-accent dark:text-gold"
        : "text-ink dark:text-starlight hover:bg-paper-deep dark:hover:bg-space-deep"
    }"
>
  <img src="${country.flag}" alt="" loading="lazy" class="w-8 h-6 rounded-sm object-cover border border-slate-200/40 dark:border-starlight-faint/10 shrink-0" />
  <div class="min-w-0 flex-1">
    <p class="text-sm font-semibold truncate">${country.name}</p>
    <p class="text-xs text-ink-faint dark:text-starlight-faint truncate">${country.capital} · ${country.region}</p>
  </div>
  <span class="font-mono text-[10px] font-bold text-ink-faint dark:text-starlight-faint shrink-0">${country.cca3}</span>
</li>
`;

/**
 * Escapa caracteres HTML peligrosos en strings de usuario.
 * Previene XSS si el query contiene `<script>` o similar.
 *
 * ¿Por qué no usamos DOMPurify? Porque el único dato de usuario
 * que se interpola es el query del input, y solo necesita escapar
 * 5 caracteres. Una librería externa sería over-engineering.
 */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
