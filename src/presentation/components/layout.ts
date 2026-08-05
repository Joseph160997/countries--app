/**
 * Componente de Maquetación Dinámica (Layout Engine).
 * Se encarga de renderizar la estructura semántica global de la aplicación.
 */

/**
 * Genera la estructura HTML del Header de la aplicación.
 */
const renderHeader = (): string => {
  return `
    <header class="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div class="container mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
        <h1 class="flex items-baseline gap-2 cursor-pointer select-none">
  <span class="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-starlight">
    Terra<span class="text-emerald-600 dark:text-emerald-400">.</span>
  </span>
  <span class="hidden sm:inline font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-ink-soft dark:text-slate-500">
    Atlas
  </span>
</h1>

        <div class="flex items-center gap-3">
          <button id="btn-show-favorites" class="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-sm border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all duration-200 cursor-pointer shadow-xs active:scale-95">
            <span class="transform group-hover:scale-110 transition-transform">❤️</span>
            <span>Favs</span>
            <span id="favs-count-display" class="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-rose-500 dark:bg-rose-600 rounded-full min-w-5 text-center">0</span>
          </button>

          <button id="theme-toggle" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-all duration-200 cursor-pointer shadow-xs active:scale-95">
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
      <!-- Sección de Controles y Filtros Avanzados -->
      <section class="mb-12 max-w-3xl mx-auto">
        <div class="flex flex-col gap-6 p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800/50 shadow-xl shadow-slate-100/40 dark:shadow-none transition-all">

          <!-- Input de Búsqueda -->
          <div class="relative w-full">
            <input type="text" id="search-input" placeholder="Search for a country by name or region..." class="w-full p-4 pl-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all shadow-inner text-sm font-medium"/>
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-lg">🔎</span>
          </div>

          <!-- Botoneras de Ordenación y Filtros -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="flex flex-wrap gap-2">
              <button id="sort-pop" class="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60 active:scale-95 shadow-xs">
                📊 Sort By Population
              </button>
              <button id="sort-name" class="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60 active:scale-95 shadow-xs">
                🔤 Sort By A-Z
              </button>
            </div>

            <select id="filter-region" class="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-xs">
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

      <!-- Contador de resultados -->
      <p id="results-count" class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 text-center"></p>

      <!-- Grid de Resultados Dinámicos -->
      <div id="result-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      </div>

      <!-- Botón Load More -->
      <div id="load-more-container" class="hidden mt-12 flex justify-center">
        <button id="btn-load-more" class="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95">
          Load More Countries
        </button>
      </div>

    </main>
  `;
};

/**
 * Genera la estructura HTML del Footer Profesional con Formulario de Feedback integrado.
 */
const renderFooter = (): string => {
  return `
    <footer class="w-full bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors mt-auto">
      <div class="container mx-auto px-4 sm:px-6 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          <!-- Columna 1: Branding e Información -->
          <div class="space-y-4">
            <h3 class="font-display text-xl font-extrabold text-slate-100 tracking-tight">
  Terra<span class="text-emerald-500">.</span>
  <span class="ml-2 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Atlas</span>
</h3>
<p class="text-sm leading-relaxed text-slate-400 max-w-sm">
  Every country on Earth, one atlas. Built with strict TypeScript, clean architecture and a day/night soul.
</p>
<p class="text-xs text-slate-500">
  &copy; ${new Date().getFullYear()} Terra · Atlas.
</p>
          </div>

          <!-- Columna 2: Enlaces / Recursos Técnicos -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold uppercase tracking-widest text-slate-200">Architecture Stack</h4>
            <ul class="text-sm space-y-2 font-medium">
              <li class="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-default">⚡ Vite + TypeScript v5</li>
              <li class="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-default">🎨 Tailwind CSS v4</li>
              <li class="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-default">📦 Custom Observer State Manager</li>
              <li class="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-default">💾 IndexedDB Offline Cache</li>
            </ul>
          </div>

          <!-- Columna 3: Formulario Profesional de Sugerencias y Recomendaciones -->
          <div class="space-y-4 bg-slate-800/40 p-5 rounded-xl border border-slate-800/60 shadow-lg">
            <div>
              <h4 class="text-sm font-bold text-slate-200 uppercase tracking-wider">Application Feedback</h4>
              <p class="text-xs text-slate-400 mt-1">Help us fine-tune future releases. Leave your improvements below.</p>
            </div>

            <form id="feedback-form" class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <input type="text" id="feedback-username" placeholder="Your Name" required class="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"/>
                <select id="feedback-rating" required class="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
              </div>
              <div class="relative">
                <textarea id="feedback-comment" rows="2" placeholder="Write your technical recommendations or feature requests..." required class="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"></textarea>
              </div>
              <button type="submit" class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-[0.98]">
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
