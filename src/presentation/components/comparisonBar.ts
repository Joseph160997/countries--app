/**
 * Barra flotante de comparación.
 *
 * Aparece en la parte inferior de la pantalla cuando hay países
 * seleccionados para comparar. Es un componente efímero:
 * el controller la crea/destruye según el estado.
 *
 * No es un modal ni un overlay. Es un elemento fijo que convive
 * con el grid. El usuario puede seguir navegando y seleccionando
 * países mientras la barra está visible.
 */

export interface ComparisonBarData {
  readonly count: number;
  readonly maxCount: number;
  readonly canCompare: boolean;
}

export const renderComparisonBar = (data: ComparisonBarData): string => {
  const { count, maxCount, canCompare } = data;

  // Si no hay países seleccionados, no renderizamos nada.
  // El controller ni siquiera llama esta función con count === 0,
  // pero el guard defensivo previene renders vacíos.
  if (count === 0) return "";

  const compareButton = canCompare
    ? `<button id="btn-open-comparison" class="px-5 py-2.5 rounded-xl bg-accent dark:bg-gold hover:bg-accent/90 dark:hover:bg-gold-soft text-white dark:text-space font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95">
        ⚖️ Compare (${count}/${maxCount})
       </button>`
    : `<span class="px-4 py-2 text-xs font-semibold text-ink-faint dark:text-starlight-faint italic">Select at least 2 to compare</span>`;

  return `
<div id="comparison-bar" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-45 flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-paper-card dark:bg-space-card border border-slate-200/60 dark:border-starlight-faint/15 shadow-2xl shadow-slate-300/50 dark:shadow-space-deep animate-fade-in-up">
  <div class="flex items-center gap-2">
    <span class="font-display text-sm font-bold text-ink dark:text-starlight">⚖️</span>
    <span class="font-mono text-xs font-bold text-ink-soft dark:text-starlight-soft">
      ${count} selected
    </span>
  </div>

  <div class="w-px h-6 bg-slate-200/60 dark:bg-starlight-faint/15"></div>

  ${compareButton}

  <button id="btn-clear-comparison" class="px-3 py-2 rounded-xl bg-paper-deep dark:bg-space-deep hover:bg-red-50 dark:hover:bg-red-950/30 text-ink-soft dark:text-starlight-soft hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition-all cursor-pointer active:scale-95">
    ✕ Clear
  </button>
</div>
  `;
};
