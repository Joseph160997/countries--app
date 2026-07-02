import type { Country } from "../types/Country";

/**
 * Componente funcional puro que genera el HTML de una tarjeta de país.
 * @param country - Objeto con los datos del país a renderizar.
 * @returns String de HTML estructurado con Tailwind CSS.
 */
export const renderCountryCard = (country: Country): string => {
  // Secuencia de clases Tailwind para el contenedor:
  // 1. Dimensiones/Forma (rounded-2xl overflow-hidden flex flex-col)
  // 2. Colores (bg-white dark:bg-slate-850 border border-slate-200/60)
  // 3. Interacción (hover:shadow-xl hover:-translate-y-1 transition-all duration-300)

  return `
    <article data-id="${country.cca3}" class="country-card bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">
      
      <div class="overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 relative">
        <img src="${country.flag}" alt="Flag of ${country.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
      </div>
      
      <div class="p-5 grow flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-slate-700 mb-3 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            ${country.name}
          </h3>
          <div class="space-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <p><span class="text-slate-400 dark:text-slate-500 font-normal">Population:</span> ${country.population.toLocaleString()}</p>
            <p><span class="text-slate-400 dark:text-slate-500 font-normal">Region:</span> ${country.region}</p>
            <p><span class="text-slate-400 dark:text-slate-500 font-normal">Capital:</span> ${country.capital}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md font-bold tracking-wider">${country.cca3}</span>
          <button data-id="${country.cca3}" class="btn-fav text-xl hover:scale-125 transition-transform cursor-pointer p-1">
            ${country.isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </article>
  `;
};

/**
Renderiza el modal de detalle de un país.
@param country País seleccionado
@param borderNames Nombres de países fronterizos
@returns HTML del modal
*/
export const renderCountryDetailModal = (
  country: Country,
  borderNames: string[],
): string => {
  // Función auxiliar para formatear arrays
  const formatArray = (items: string[]): string =>
    items.length > 0 ? items.join(", ") : "N/A";

  const formattedLanguages = formatArray(country.languages);
  const formattedCurrencies = formatArray(country.currencies);
  const formattedTld = formatArray(country.tld);

  const capital = country.capital || "N/A";
  const subregion = country.subregion || "N/A";
  const population = country.population?.toLocaleString() ?? "N/A";

  const bordersHTML =
    borderNames.length > 0
      ? borderNames
          .map((name, index) => {
            const borderCode = country.borders?.[index] ?? "";

            return `
          <button
            class="btn-border px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-600 hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-sm"
            data-cca3="${borderCode}"
          >
            ${name}
          </button>
        `;
          })
          .join("")
      : `
    <span class="text-slate-400 italic text-sm">
      No border countries
    </span>
  `;

  return `
<div class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-modal-in">

  <button
    id="close-modal"
    aria-label="Close modal"
    class="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2.5"
      stroke="currentColor"
      class="w-5 h-5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  </button>

  <div class="md:w-1/2 h-64 md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800">
    <img
      src="${country.flag}"
      alt="Flag of ${country.name}"
      loading="lazy"
      class="w-full h-full object-cover shadow-inner"
    />
  </div>

  <div class="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">

    <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
      ${country.name}
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-8 text-sm text-slate-700 dark:text-slate-300">

      <div class="space-y-3">
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Region:</span> ${country.region}</p>
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Subregion:</span> ${subregion}</p>
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Capital:</span> ${capital}</p>
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Population:</span> ${population}</p>
      </div>

      <div class="space-y-3">
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Top Level Domain:</span> ${formattedTld}</p>
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Currencies:</span> ${formattedCurrencies}</p>
        <p><span class="font-bold text-slate-500 dark:text-slate-400">Languages:</span> ${formattedLanguages}</p>
      </div>

    </div>

    <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
      <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
        Border Countries
      </h4>

      <div class="flex flex-wrap gap-2">
        ${bordersHTML}
      </div>
    </div>

  </div>
</div>

`;
};
