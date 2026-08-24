/**
 * Configuración de la tarjeta de Empty State
 * @see {@link renderEmptyStateCard}
 */
interface EmptyStateConfig {
  title: string;
  description: string;
  showButton?: boolean;
}

/** Genera la estructura HTML de la tarjeta de Empty State, que se muestra cuando no se encuentran resultados. */
export const renderEmptyStateCard = (config: EmptyStateConfig): string => {
  const { title, description, showButton = true } = config;
  return `
<div id="empty-state-card" class="col-span-full flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto animate-fade-in-up">
  <div class="flex items-center justify-center w-16 h-16 bg-accent-soft dark:bg-gold/10 text-accent dark:text-gold rounded-full mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  </div>
  <h2 class="font-display text-xl font-bold text-ink dark:text-starlight mb-2">${title}</h2>
  <p class="text-sm text-ink-soft dark:text-starlight-soft mb-6 max-w-xs">${description}</p>
  ${
    showButton
      ? `
<button id="btn-empty-state-explore" class="px-5 py-2.5 bg-accent hover:bg-accent/90 dark:bg-gold dark:hover:bg-gold-soft dark:text-space text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-md">
Go Back Exploring
</button>
`
      : ""
  }
</div>
`;
};
