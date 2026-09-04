import type { Country } from "@/domain/country";
import type { ComparisonRow } from "@/presentation/slices/comparison.selectors";
import { getRegionAccentClass } from "@/presentation/components/countryCards";
import { escapeHtml, sanitizeUrl } from "../utils";

export interface ComparisonViewData {
  readonly countries: readonly Country[];
  readonly rows: readonly ComparisonRow[];
}

export const renderComparisonView = (data: ComparisonViewData): string => {
  const { countries, rows } = data;

  // Header: banderas + nombres + botón de quitar
  const headerCells = countries
    .map(
      (country) => `
      <div class="flex flex-col items-center gap-2 min-w-35">
        <div class="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-200/60 dark:border-starlight-faint/15 shadow-sm shrink-0">
          <img src="${escapeHtml(sanitizeUrl(country.flag))}" alt="Flag of ${escapeHtml(country.name)}" class="w-full h-full object-cover" />
          <div class="h-0.5 ${getRegionAccentClass(country.region)} absolute bottom-0 left-0 right-0"></div>
        </div>
        <p class="font-display text-sm font-bold text-ink dark:text-starlight text-center leading-tight truncate w-24">${escapeHtml(country.name)}</p>
        <span class="font-mono text-[10px] font-bold text-ink-faint dark:text-starlight-faint">${escapeHtml(country.cca3)}</span>
      </div>
    `,
    )
    .join("");

  // Filas de la tabla
  const rowsHTML = rows
    .map((row) => {
      const cells = row.values
        .map(
          (value) => `
          <td class="px-3 py-2.5 text-sm font-medium text-ink dark:text-starlight text-center border-b border-slate-200/50 dark:border-starlight-faint/10 min-w-35">
            ${escapeHtml(String(value))}
          </td>
        `,
        )
        .join("");
      return `
        <tr>
          <td class="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-faint dark:text-starlight-faint border-b border-slate-200/50 dark:border-starlight-faint/10 whitespace-nowrap sticky left-0 bg-paper-card dark:bg-space-card z-10 min-w-30">
            ${escapeHtml(row.label)}
          </td>
          ${cells}
        </tr>
      `;
    })
    .join("");

  return `
    <div id="comparison-overlay" class="fixed inset-0 z-55 flex items-center justify-center p-4 bg-ink/50 dark:bg-space-deep/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Country comparison">
      <div class="w-full max-w-3xl max-h-[85vh] bg-paper-card dark:bg-space-card rounded-2xl shadow-2xl border border-slate-200/60 dark:border-starlight-faint/15 overflow-hidden flex flex-col animate-fade-in-up">
        <!-- Header del overlay -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-starlight-faint/10">
          <h2 class="font-display text-lg font-extrabold text-ink dark:text-starlight tracking-tight">
            ⚖️ Compare Countries
            <span class="font-mono text-xs font-bold text-ink-faint dark:text-starlight-faint ml-2">(${countries.length}/3)</span>
          </h2>
          <button id="close-comparison" aria-label="Close comparison" class="p-2 rounded-full bg-paper-deep dark:bg-space-deep hover:bg-accent-soft dark:hover:bg-gold/20 text-ink-soft dark:text-starlight-soft transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Cuerpo con scroll -->
        <div class="min-h-0 flex-1 overflow-y-auto">
          <!-- Header: banderas y nombres (sticky top + scrollable horizontal) -->
          <div class="overflow-x-auto border-b border-slate-200/60 dark:border-starlight-faint/10">
            <div class="inline-flex gap-4 px-6 py-4 min-w-full">
              <div class="min-w-30 sticky left-0 bg-paper-card dark:bg-space-card z-10"></div>
              ${headerCells}
            </div>
          </div>

          <!-- Tabla comparativa con scroll horizontal + fade indicator -->
<div class="relative overflow-hidden">
  <div class="comparison-scroll overflow-x-auto" role="region" aria-label="Comparison data table">
    <table class="w-full border-collapse min-w-full">
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  </div>
  <!-- Fade indicator: solo visible en móvil, indica que hay más contenido a la derecha -->
  <div class="comparison-fade pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-paper-card dark:from-space-card to-transparent md:hidden" aria-hidden="true"></div>
</div>

        <!-- Footer con hints -->
        <div class="flex items-center justify-between px-6 py-3 border-t border-slate-200/60 dark:border-starlight-faint/10 bg-paper-deep/50 dark:bg-space-deep/50">
          <span class="text-[10px] font-mono text-ink-faint dark:text-starlight-faint">
            <kbd class="px-1 py-0.5 rounded bg-paper-card dark:bg-space-card border border-slate-200/60 dark:border-starlight-faint/10">esc</kbd> close
          </span>
          <span class="text-[10px] font-mono text-ink-faint dark:text-starlight-faint">${countries.length} countries</span>
        </div>
      </div>
    </div>
  `;
};
