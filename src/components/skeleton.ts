// src/components/skeleton.ts

/**
 * Genera una tarjeta skeleton que imita la forma de una CountryCard real.
 * La animación pulse es nativa de Tailwind — no necesita JS.
 */
const renderSkeletonCard = (): string => {
  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md overflow-hidden flex flex-col">
      
      <!-- Imagen falsa -->
      <div class="h-40 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
      
      <div class="p-5 flex flex-col gap-3">
        <!-- Título falso -->
        <div class="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        
        <!-- Líneas de datos falsas -->
        <div class="space-y-2 mt-1">
          <div class="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
          <div class="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
          <div class="h-3 w-4/6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        
        <!-- Footer falso -->
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div class="h-5 w-10 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
          <div class="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Renderiza N tarjetas skeleton para llenar el grid mientras carga.
 * @param count - Cuántas tarjetas fantasma mostrar (default: 20, igual que visibleCount)
 */
export const renderSkeletonGrid = (count: number = 20): string => {
  return Array.from({ length: count }, renderSkeletonCard).join("");
};
