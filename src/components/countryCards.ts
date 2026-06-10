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
    <article data-id="${country.cca3}" class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">
      
      <div class="overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 relative">
        <img src="${country.flag}" alt="Flag of ${country.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
      </div>
      
      <div class="p-5 grow flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
