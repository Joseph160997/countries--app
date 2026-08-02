import type { Country } from "@/domain/country";
const getRegionBadgeClasses = (region: string): string => {
  const classes: Record<string, string> = {
    Americas: "bg-emerald-100 text-emerald-800",
    Europe: "bg-indigo-100 text-indigo-800",
    Asia: "bg-amber-100 text-amber-800",
    Africa: "bg-rose-100 text-rose-800",
    Oceania: "bg-cyan-100 text-cyan-800",
  };
  return classes[region] || "bg-slate-100 text-slate-800";
};

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
    <article data-id="${country.cca3}" class="country-card bg-white dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700/40 shadow-sm dark:shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">

      <div class="overflow-hidden h-40 bg-slate-100 dark:bg-slate-900/30 relative">
        <img src="${country.flag}" alt="Flag of ${country.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
      </div>

      <div class="p-5 grow flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            ${country.name}
          </h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRegionBadgeClasses(country.region)}">
            ${country.region}
          </span>
          <div class="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <p><span class="font-normal">Population:</span> ${country.population.toLocaleString()}</p>
            <p><span class="font-normal">Region:</span> ${country.region}</p>
            <p><span class="font-normal">Capital:</span> ${country.capital}</p>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
          <span class="text-[10px] bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-medium tracking-wider">${country.cca3}</span>
          <button data-id="${country.cca3}" class="btn-fav text-xl hover:scale-110 transition-transform duration-200 cursor-pointer p-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
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
            <span
              class="border-chip inline-block px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-medium transition-colors cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
              data-cca3="${borderCode}"
            >
              ${name.trim()}
            </span>
          `;
          })
          .join("")
      : `
      <span class="text-slate-400 italic text-sm">
        No border countries
      </span>
    `;

  return `
<div class="relative w-full max-w-4xl bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 animate-fade-in-up">

  <button
    id="close-modal"
    aria-label="Close modal"
    class="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2.5"
      stroke="currentColor"
      class="w-5 h-5 text-slate-500 dark:text-slate-400"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  </button>

  <div class="md:flex">
    <div class="md:w-1/2 h-48 md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800/50 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
      <img
        src="${country.flag}"
        alt="Flag of ${country.name}"
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="md:w-1/2 p-6 lg:p-8 flex flex-col">

      <h2 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        ${country.name}
      </h2>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 mb-3 ${getRegionBadgeClasses(country.region)}">
        ${country.region}
      </span>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">${country.region} · ${subregion}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Population</p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">${population}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Capital</p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">${capital}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Top Level Domain</p>
          <p class="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate">${formattedTld}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Currencies</p>
          <p class="font-medium text-slate-900 dark:text-slate-100">${formattedCurrencies}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Languages</p>
          <p class="font-medium text-slate-900 dark:text-slate-100">${formattedLanguages}</p>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Border Countries</h4>
        <div class="flex flex-wrap gap-2">
  ${bordersHTML}
</div>
        </div>
      </div>

    </div>
  </div>
</div>
`;
};
