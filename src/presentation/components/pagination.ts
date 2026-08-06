/**
 * Paginación numerada estilo plataforma de contenidos.
 * Desktop: ventana completa con elipsis. Móvil: ventana compacta.
 */

export type PageItem = number | "ellipsis";

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

/** Ventana desktop: anclas (1 y total) + elipsis + actual ±1. */
export const buildPageWindow = (current: number, total: number): PageItem[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: PageItem[] = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  if (windowStart > 2) items.push("ellipsis");
  for (let i = windowStart; i <= windowEnd; i++) items.push(i);
  if (windowEnd < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
};

/** Ventana móvil: hasta 5 páginas consecutivas centradas en la actual. */
export const buildCompactWindow = (
  current: number,
  total: number,
): number[] => {
  const visible = Math.min(5, total);
  let start = current - 2;
  if (start < 1) start = 1;
  if (start + visible - 1 > total) start = total - visible + 1;
  return Array.from({ length: visible }, (_, i) => start + i);
};

/** Botón de navegación (número). */
const numberButton = (page: number, isActive: boolean): string => `
  <button
    data-page="${page}"
    aria-current="${isActive ? "page" : "false"}"
    class="min-w-10 h-10 px-2 rounded-lg font-mono text-sm font-semibold border transition-all cursor-pointer active:scale-95
      ${
        isActive
          ? "bg-accent dark:bg-gold text-white dark:text-space border-accent dark:border-gold shadow-md"
          : "bg-paper-card dark:bg-space-card text-ink dark:text-starlight border-slate-200/60 dark:border-starlight-faint/15 hover:border-accent dark:hover:border-gold hover:text-accent dark:hover:text-gold"
      }"
  >
    ${page}
  </button>
`;

/** Botón de navegación (anterior/siguiente). */
const navButton = (page: number, label: string, disabled: boolean): string => `
  <button
    data-page="${page}"
    ${disabled ? "disabled" : ""}
    class="h-10 px-3 rounded-lg font-sans text-sm font-bold border transition-all active:scale-95
      ${
        disabled
          ? "opacity-40 cursor-not-allowed bg-paper-deep dark:bg-space-deep text-ink-faint dark:text-starlight-faint border-slate-200/60 dark:border-starlight-faint/15"
          : "cursor-pointer bg-paper-card dark:bg-space-card text-ink dark:text-starlight border-slate-200/60 dark:border-starlight-faint/15 hover:border-accent dark:hover:border-gold hover:text-accent dark:hover:text-gold"
      }"
  >
    ${label}
  </button>
`;

export const renderPagination = ({
  currentPage,
  totalPages,
  totalResults,
}: PaginationData): string => {
  if (totalResults === 0 || totalPages <= 1) return "";

  const desktopItems = buildPageWindow(currentPage, totalPages)
    .map((item) =>
      item === "ellipsis"
        ? `<span class="min-w-10 h-10 flex items-center justify-center font-mono text-slate-400 dark:text-slate-500 select-none">…</span>`
        : numberButton(item, item === currentPage),
    )
    .join("");

  const mobileItems = buildCompactWindow(currentPage, totalPages)
    .map((page) => numberButton(page, page === currentPage))
    .join("");

  return `
  <nav aria-label="Pagination" class="flex flex-col items-center gap-4">
    <p class="font-mono text-xs font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-widest">
      Page ${currentPage} of ${totalPages} · ${totalResults.toLocaleString()} results
    </p>

    <div class="hidden md:flex items-center gap-1.5">
      ${navButton(currentPage - 1, "← Prev", currentPage <= 1)}
      ${desktopItems}
      ${navButton(currentPage + 1, "Next →", currentPage >= totalPages)}
    </div>

    <div class="flex md:hidden items-center gap-1.5">
      ${navButton(currentPage - 1, "←", currentPage <= 1)}
      ${mobileItems}
      ${navButton(currentPage + 1, "→", currentPage >= totalPages)}
    </div>
  </nav>
  `;
};
