/**
 * Componente de Maquetación Dinámica (Layout Engine).
 * Se encarga de renderizar la estructura semántica global de la aplicación.
 */

/**
 * Genera la estructura HTML del Header de la aplicación.
 */
const renderHeader = (): string => {
  return `
<header class="sticky top-0 z-40 w-full bg-paper/85 dark:bg-space-deep/85 backdrop-blur-md border-b border-slate-200/80 dark:border-starlight-faint/10 transition-colors duration-300">
  <div class="container mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
    <h1 class="flex items-baseline gap-2 cursor-pointer select-none">
      <span class="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-starlight">
        Terra<span class="text-accent dark:text-gold">.</span>
      </span>
      <span class="hidden sm:inline font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint dark:text-starlight-faint">
        Atlas
      </span>
    </h1>
    <div class="flex items-center gap-3">
      <button id="btn-show-favorites" aria-label="Show favorites" class="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-paper-card dark:bg-space-card text-accent dark:text-gold font-semibold text-sm border border-slate-200/60 dark:border-starlight-faint/15 hover:border-accent dark:hover:border-gold transition-all duration-200 cursor-pointer shadow-xs active:scale-95">
        <span class="transform group-hover:scale-110 transition-transform">❤️</span>
        <span>Favs</span>
        <span id="favs-count-display" class="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-accent dark:bg-gold dark:text-space rounded-full min-w-5 text-center">0</span>
      </button>
      <button
  id="btn-random-country"
  aria-label="Open a random country"
  title="Random country"
  class="p-2.5 rounded-xl bg-paper-card dark:bg-space-card text-ink dark:text-starlight border border-slate-200/60 dark:border-starlight-faint/15 hover:border-accent dark:hover:border-gold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
>
  <span class="text-lg" aria-hidden="true">🎲</span>
</button>
      <button id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode" class="p-2.5 rounded-xl bg-paper-card dark:bg-space-card text-ink dark:text-starlight border border-slate-200/60 dark:border-starlight-faint/15 hover:border-accent dark:hover:border-gold transition-all duration-200 cursor-pointer shadow-xs active:scale-95">
        <span class="dark:hidden text-lg">🌛</span>
        <span class="hidden dark:inline text-lg">🌞</span>
      </button>
    </div>
  </div>
</header>
`;
};

/**
 * Genera la estructura HTML del Main de la aplicación.
 * @returns
 */
const renderMain = (): string => {
  return `
<main class="container mx-auto px-4 sm:px-6 py-10 grow">
  <!-- Buscador protagonista -->
  <section class="mb-10 max-w-3xl mx-auto">
    <div class="relative w-full">
      <input type="text" id="search-input" placeholder="Search countries, capitals, regions…" class="w-full sm:p-5 pl-14 rounded-2xl bg-paper-card dark:bg-space-card border border-slate-200/80 dark:border-starlight-faint/15 text-ink dark:text-starlight placeholder-ink-faint dark:placeholder-starlight-faint focus:outline-none focus:ring-2 focus:ring-accent/60 dark:focus:ring-gold/60 focus:border-transparent transition-all shadow-lg shadow-slate-200/60 dark:shadow-none text-base font-medium"/>
      <span class="absolute left-5 top-1/2 -translate-y-1/2 text-ink-faint dark:text-starlight-faint pointer-events-none text-xl">🔎</span>
    </div>
  </section>

  <!-- Hero carrusel (lo llena el renderer) -->
  <div id="hero-container" class="mb-12"></div>

  <!-- Toolbar: orden + región -->
  <section class="mb-8">
    <div class="flex flex-col gap-4 p-5 rounded-2xl bg-paper-card dark:bg-space-card border border-slate-200/60 dark:border-starlight-faint/15 shadow-sm transition-all">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <button id="sort-pop" class="px-4 py-2.5 rounded-lg bg-paper-deep dark:bg-space-deep hover:bg-accent dark:hover:bg-gold hover:text-white dark:hover:text-space text-ink-soft dark:text-starlight-soft transition-all cursor-pointer text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-starlight-faint/15 active:scale-95 shadow-xs">
            📊 Sort By Population
          </button>
          <button id="sort-name" class="px-4 py-2.5 rounded-lg bg-paper-deep dark:bg-space-deep hover:bg-accent dark:hover:bg-gold hover:text-white dark:hover:text-space text-ink-soft dark:text-starlight-soft transition-all cursor-pointer text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-starlight-faint/15 active:scale-95 shadow-xs">
            🔤 Sort By A-Z
          </button>
          <button id="sort-area" class="px-4 py-2.5 rounded-lg bg-paper-deep dark:bg-space-deep hover:bg-accent dark:hover:bg-gold hover:text-white dark:hover:text-space text-ink-soft dark:text-starlight-soft transition-all cursor-pointer text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-starlight-faint/15 active:scale-95 shadow-xs">
            📐 Sort By Area
          </button>
        </div>
        <select id="filter-region" class="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-paper-deep dark:bg-space-deep text-ink-soft dark:text-starlight-soft text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-starlight-faint/15 outline-none focus:ring-2 focus:ring-accent/60 dark:focus:ring-gold/60 cursor-pointer shadow-xs">
          <option value="">All Regions</option>
          <option value="Africa">Africa</option>
          <option value="Americas">Americas</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
          <option value="Oceania">Oceania</option>
        </select>
      </div>
    </div>
  </section>

  <!-- Grid de Resultados -->
  <div id="result-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
  </div>

  <!-- Paginación -->
  <div id="pagination-container" class="mt-12"></div>
</main>
`;
};

/**
 * Genera la estructura HTML del Footer Profesional con Formulario de Feedback integrado.
 */
const renderFooter = (): string => {
  return `
<footer class="w-full bg-space-deep text-starlight-soft border-t border-starlight-faint/15 transition-colors mt-auto">
  <div class="container mx-auto px-4 sm:px-6 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      <div class="space-y-4">
        <h3 class="font-display text-xl font-extrabold text-starlight tracking-tight">
          Terra<span class="text-gold">.</span>
          <span class="ml-2 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-starlight-faint">Atlas</span>
        </h3>
        <p class="text-sm leading-relaxed text-starlight-soft max-w-sm">
          Every country on Earth, one atlas. Built with strict TypeScript, clean architecture and a day/night soul.
        </p>
        <p class="text-xs text-starlight-faint">
          &copy; ${new Date().getFullYear()} Terra · Atlas.
        </p>
      </div>
      <div class="space-y-3">
        <h4 class="text-sm font-bold uppercase tracking-widest text-starlight">Architecture Stack</h4>
        <ul class="text-sm space-y-2 font-medium">
          <li class="flex items-center gap-2 hover:text-gold transition-colors cursor-default">⚡ Vite + TypeScript v5</li>
          <li class="flex items-center gap-2 hover:text-gold transition-colors cursor-default">🎨 Tailwind CSS v4</li>
          <li class="flex items-center gap-2 hover:text-gold transition-colors cursor-default">📦 Custom Observer State Manager</li>
          <li class="flex items-center gap-2 hover:text-gold transition-colors cursor-default">💾 IndexedDB Offline Cache</li>
        </ul>
      </div>
      <div class="space-y-4 bg-space-card/60 p-5 rounded-xl border border-starlight-faint/15 shadow-lg">
        <div>
          <h4 class="text-sm font-bold text-starlight uppercase tracking-wider">Application Feedback</h4>
          <p class="text-xs text-starlight-soft mt-1">Help us fine-tune future releases. Leave your improvements below.</p>
        </div>
        <form id="feedback-form" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <input type="text" id="feedback-username" placeholder="Your Name" required class="w-full p-2.5 rounded-lg bg-space-deep border border-starlight-faint/15 text-xs text-starlight placeholder-starlight-faint focus:outline-none focus:ring-1 focus:ring-gold transition-all"/>
            <select id="feedback-rating" required class="w-full p-2.5 rounded-lg bg-space-deep border border-starlight-faint/15 text-xs text-starlight focus:outline-none focus:ring-1 focus:ring-gold transition-all cursor-pointer">
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
              <option value="3">⭐⭐⭐ (3/5)</option>
              <option value="2">⭐⭐ (2/5)</option>
              <option value="1">⭐ (1/5)</option>
            </select>
          </div>
          <div class="relative">
            <textarea id="feedback-comment" rows="2" placeholder="Write your technical recommendations or feature requests..." required class="w-full p-2.5 rounded-lg bg-space-deep border border-starlight-faint/15 text-xs text-starlight placeholder-starlight-faint focus:outline-none focus:ring-1 focus:ring-gold resize-none transition-all"></textarea>
          </div>
          <button type="submit" class="w-full py-2 rounded-lg bg-gold hover:bg-gold-soft text-space font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-[0.98]">
            Submit Recommendation
          </button>
        </form>
      </div>
    </div>
  </div>
</footer>
`;
};

/**
 * Función Pública Principal para inicializar e inyectar el Layout de forma síncrona en el DOM.
 * @param targetId - ID del contenedor base del HTML original.
 * @throws Error si no se encuentra el elemento contenedor en el DOM.
 */
export const initializeLayout = (targetId: string = "app"): void => {
  const container = document.getElementById(targetId);

  if (!container) {
    throw new Error(
      `[Layout Engine] Fatal: Target element with id "${targetId}" was not found in the DOM.`,
    );
  }

  // Ensamblado e inyección síncrona completa de las piezas del layout
  container.innerHTML = `
    ${renderHeader()}
    ${renderMain()}
    ${renderFooter()}
  `;
};
