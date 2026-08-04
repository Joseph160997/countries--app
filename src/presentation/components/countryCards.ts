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
      : `<span class="text-slate-400 italic text-sm">No border countries</span>`;

  return `
  <div class="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 animate-fade-in-up flex flex-col">
    <button
      id="close-modal"
      aria-label="Close modal"
      class="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/70 dark:bg-slate-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer backdrop-blur-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-slate-500 dark:text-slate-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="md:flex overflow-y-auto grow">
      <div class="md:w-1/2 h-48 md:h-auto md:sticky md:top-0 md:self-start overflow-hidden bg-slate-100 dark:bg-slate-800/50">
        <img src="${country.flag}" alt="Flag of ${country.name}" loading="lazy" class="w-full h-full md:h-auto object-cover"/>
      </div>

      <div class="md:w-1/2 p-6 lg:p-8">
        <h2 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">${country.name}</h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 mb-3 ${getRegionBadgeClasses(country.region)}">
          ${country.region}
        </span>
        <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">${country.region} · ${subregion}</p>

        <!-- Ficha: población, capital, área, densidad -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          ${renderStatBox("Population", population)}
          ${renderStatBox("Capital", capital)}
          ${renderStatBox("Area", formatArea(country.areaKm2))}
          ${renderStatBox("Density", formatDensity(country.density))}
        </div>

        ${renderMemberships(country.memberships)}
        ${renderFactsGrid(country)}

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
          <div class="flex flex-wrap gap-2">${bordersHTML}</div>
        </div>

        ${renderExploreLinks(country)}
      </div>
    </div>
  </div>
  `;
};
// ========================================================
// FASE 3 — Helpers de la ficha de país
// ========================================================
const formatArea = (km2: number | undefined): string =>
  km2 !== undefined ? `${km2.toLocaleString()} km²` : "N/A";

const formatDensity = (density: number | undefined): string =>
  density !== undefined ? `${density.toLocaleString()} / km²` : "N/A";

const renderStatBox = (label: string, value: string): string => `
  <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">${label}</p>
    <p class="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 wrap-break-words">${value}</p>
  </div>
`;

const MEMBERSHIP_STYLES: Record<string, string> = {
  UN: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
  EU: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
  NATO: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
  G7: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  G20: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
  Schengen: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200",
};

const renderMemberships = (memberships: string[] | undefined): string => {
  if (!memberships || memberships.length === 0) return "";
  const badges = memberships
    .map((m) => {
      const style =
        MEMBERSHIP_STYLES[m] ??
        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${style}">${m}</span>`;
    })
    .join("");
  return `
    <div class="mb-5">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Memberships</p>
      <div class="flex flex-wrap gap-1.5">${badges}</div>
    </div>
  `;
};

const renderFactsGrid = (country: Country): string => {
  const facts: Array<{ icon: string; label: string; value: string }> = [];
  if (country.timezones && country.timezones.length > 0) {
    facts.push({ icon: "🕐", label: "Timezone", value: country.timezones[0] });
  }
  if (country.callingCodes && country.callingCodes.length > 0) {
    facts.push({
      icon: "📞",
      label: "Dialing",
      value: country.callingCodes.join(" "),
    });
  }
  if (country.drivingSide) {
    facts.push({ icon: "🚗", label: "Drives on", value: country.drivingSide });
  }
  if (country.landlocked !== undefined) {
    facts.push({
      icon: "🏔️",
      label: "Landlocked",
      value: country.landlocked ? "Yes" : "No",
    });
  }
  if (facts.length === 0) return "";

  const cells = facts
    .map(
      (f) => `
      <div class="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-700/40 px-3 py-2.5 rounded-lg min-w-0">
        <span class="text-base shrink-0">${f.icon}</span>
        <div class="min-w-0">
          <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">${f.label}</p>
          <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate capitalize">${f.value}</p>
        </div>
      </div>
    `,
    )
    .join("");
  return `<div class="grid grid-cols-2 gap-2 mb-5">${cells}</div>`;
};

const renderExploreLinks = (country: Country): string => {
  const links = country.links;
  if (!links) return "";
  const items: Array<{ href: string; label: string; icon: string }> = [];
  if (links.googleMaps)
    items.push({ href: links.googleMaps, label: "Google Maps", icon: "🗺️" });
  if (links.openStreetMaps)
    items.push({
      href: links.openStreetMaps,
      label: "OpenStreetMap",
      icon: "🌐",
    });
  if (links.wikipedia)
    items.push({ href: links.wikipedia, label: "Wikipedia", icon: "📖" });
  if (items.length === 0) return "";

  const buttons = items
    .map(
      (item) => `
      <a href="${item.href}" target="_blank" rel="noopener noreferrer"
         class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-600/60">
        <span>${item.icon}</span> ${item.label}
      </a>
    `,
    )
    .join("");
  return `
    <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/50">
      <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Explore More</h4>
      <div class="flex flex-col sm:flex-row gap-2">${buttons}</div>
    </div>
  `;
};
