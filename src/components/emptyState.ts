/**
 * Componente funcional puro que genera el HTML para el estado vacío de favoritos.
 * @returns String de HTML estructurado con la secuencia de Tailwind CSS.
 */
export const renderEmptyStateCard = (): string => {
  // Secuencia de clases Tailwind para el contenedor:
  // 1. Layout (col-span-full flex flex-col items-center justify-center text-center)
  // 2. Espaciado/Dimensiones (py-16 px-4 max-w-md mx-auto)

  return `
    <div id="empty-state-card" class="col-span-full flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto matching-fade-in">
      
      <div class="flex items-center justify-center w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full mb-4 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </div>

      <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        Your favorites list is empty
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        You haven't marked any countries as favorites yet. Start exploring and click the heart icon on your favorite places!
      </p>

      <button id="btn-empty-state-explore" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-sm">
        Go Back Exploring
      </button>
    </div>
  `;
};
