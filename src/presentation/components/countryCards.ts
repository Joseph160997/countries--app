import type { Country } from "@/domain/country";
import type { WeatherData } from "@/domain/weather";
import type { WikiSummary } from "@/domain/wiki";
import type { AsyncStatus } from "@/presentation/slices/modal.slice";

export const getRegionBadgeClasses = (region: string): string => {
  const classes: Record<string, string> = {
    Americas:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    Europe: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    Asia: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    Africa:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
    Oceania: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  };
  return (
    classes[region] ||
    "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300"
  );
};

/**
 * Componente funcional puro que genera el HTML de una tarjeta de país.
 * @param country - Objeto con los datos del país a renderizar.
 * @returns String de HTML estructurado con Tailwind CSS.
 */
export const renderCountryCard = (country: Country): string => {
  return `
<article data-id="${country.cca3}" class="country-card bg-paper-card dark:bg-space-card rounded-xl border border-slate-200/60 dark:border-starlight-faint/15 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">
  <div class="overflow-hidden h-40 bg-paper-deep dark:bg-space-deep relative">
    <img src="${country.flag}" alt="Flag of ${country.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
  </div>
  <div class="p-5 grow flex flex-col justify-between">
    <div>
      <h3 class="font-display text-lg font-bold text-ink dark:text-starlight mb-3 tracking-tight group-hover:text-accent dark:group-hover:text-gold transition-colors">
        ${country.name}
      </h3>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getRegionBadgeClasses(country.region)}">
        ${country.region}
      </span>
      <div class="space-y-1.5 text-xs font-medium text-ink-soft dark:text-starlight-soft mt-3">
        <p><span class="text-ink-faint dark:text-starlight-faint">Population:</span> ${country.population.toLocaleString()}</p>
        <p><span class="text-ink-faint dark:text-starlight-faint">Region:</span> ${country.region}</p>
        <p><span class="text-ink-faint dark:text-starlight-faint">Capital:</span> ${country.capital}</p>
      </div>
    </div>
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-starlight-faint/15">
      <span class="font-mono text-[10px] bg-paper-deep dark:bg-space-deep text-ink-soft dark:text-starlight-soft px-2 py-1 rounded-md font-semibold tracking-wider">${country.cca3}</span>
      <button data-id="${country.cca3}" class="btn-fav text-xl hover:scale-110 transition-transform duration-200 cursor-pointer p-1 text-ink-faint dark:text-starlight-faint hover:text-accent dark:hover:text-gold">
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
  weather: WeatherData | null = null,
  weatherStatus: AsyncStatus = "idle",
  wiki: WikiSummary | null = null,
  wikiStatus: AsyncStatus = "idle",
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
                class="border-chip inline-block px-3 py-1.5 bg-accent-soft dark:bg-gold/10 text-accent dark:text-gold rounded-full text-xs font-semibold transition-colors cursor-pointer hover:bg-accent hover:text-white dark:hover:bg-gold dark:hover:text-space"
                data-cca3="${borderCode}"
              >
                ${name.trim()}
              </span>
            `;
          })
          .join("")
      : `<span class="text-ink-faint dark:text-starlight-faint italic text-sm">No border countries</span>`;

  return `
  <div class="relative w-full max-w-4xl max-h-[90vh] bg-paper-card dark:bg-space-card rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 dark:border-starlight-faint/15 animate-fade-in-up flex flex-col">
    <button
      id="close-modal"
      aria-label="Close modal"
      class="absolute top-4 right-4 z-20 p-2 rounded-full bg-paper-card/70 dark:bg-space-deep/70 hover:bg-accent-soft dark:hover:bg-gold/20 transition-colors cursor-pointer backdrop-blur-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-ink-soft dark:text-starlight-soft">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="md:flex overflow-y-auto grow">
      <div class="md:w-1/2 h-48 md:h-auto md:sticky md:top-0 md:self-start overflow-hidden bg-paper-deep dark:bg-space-deep">
        <img src="${country.flag}" alt="Flag of ${country.name}" loading="lazy" class="w-full h-full md:h-auto object-cover"/>
      </div>

      <div class="md:w-1/2 p-6 lg:p-8">
        <h2 class="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-starlight mb-2">${country.name}</h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 mb-3 ${getRegionBadgeClasses(country.region)}">
          ${country.region}
        </span>
        <p class="text-ink-soft dark:text-starlight-soft text-sm mb-6">${country.region} · ${subregion}</p>

        ${renderWeatherWidget(weather, weatherStatus, capital)}

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
            <p class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1">Top Level Domain</p>
            <p class="font-mono text-sm bg-paper-deep dark:bg-space-deep px-2 py-1 rounded truncate">${formattedTld}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1">Currencies</p>
            <p class="font-medium text-ink dark:text-starlight">${formattedCurrencies}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1">Languages</p>
            <p class="font-medium text-ink dark:text-starlight">${formattedLanguages}</p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-200/60 dark:border-starlight-faint/15">
          <h4 class="text-sm font-bold text-ink dark:text-starlight mb-3">Border Countries</h4>
          <div class="flex flex-wrap gap-2">${bordersHTML}</div>
        </div>

        ${renderWikiWidget(wiki, wikiStatus)}

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
  <div class="bg-paper-deep dark:bg-space-deep/60 p-4 rounded-xl border border-slate-200/40 dark:border-starlight-faint/10">
    <p class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1">${label}</p>
    <p class="text-base lg:text-lg font-bold text-ink dark:text-starlight wrap-break-word">${value}</p>
  </div>
`;

const MEMBERSHIP_STYLES: Record<string, string> = {
  UN: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  EU: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  NATO: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  G7: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  G20: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  Schengen: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
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
            <div class="flex items-center gap-2.5 bg-paper-deep dark:bg-space-deep/40 px-3 py-2.5 rounded-lg min-w-0 border border-slate-200/40 dark:border-starlight-faint/10">
        <span class="text-base shrink-0">${f.icon}</span>
        <div class="min-w-0">
          <p class="text-[10px] font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider">${f.label}</p>
          <p class="text-xs font-bold text-ink dark:text-starlight truncate capitalize">${f.value}</p>
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
         class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-paper-deep dark:bg-space-deep/60 hover:bg-accent hover:text-white dark:hover:bg-gold dark:hover:text-space text-ink dark:text-starlight text-xs font-bold transition-all border border-slate-200/60 dark:border-starlight-faint/15">
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

export const renderWeatherWidget = (
  weather: WeatherData | null,
  status: AsyncStatus,
  capital: string,
): string => {
  let content = "";

  if (status === "loading") {
    content = `
      <div class="p-4 rounded-xl bg-paper-deep dark:bg-space-deep/60 border border-slate-200/60 dark:border-starlight-faint/10 animate-pulse">
        <div class="h-4 w-1/2 bg-slate-200 dark:bg-space-deep rounded mb-2"></div>
        <div class="h-3 w-2/3 bg-slate-200 dark:bg-space-deep rounded"></div>
      </div>`;
  } else if (status === "error" || !weather) {
    content = `
      <div class="p-3 rounded-xl bg-paper-deep dark:bg-space-deep/40 text-xs text-ink-faint dark:text-starlight-faint italic">
        Weather unavailable for ${capital}
      </div>`;
  } else {
    content = `
      <div class="p-4 rounded-xl bg-linear-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-space-deep border border-sky-100 dark:border-sky-900/30">
        <div class="flex items-center gap-4">
          <span class="text-4xl">${weather.icon}</span>
          <div class="min-w-0">
            <p class="text-xl font-bold text-ink dark:text-starlight">
              ${Math.round(weather.temperatureC)}°C
              <span class="text-sm font-semibold text-ink-soft dark:text-starlight-soft">in ${capital}</span>
            </p>
            <p class="text-xs font-semibold text-ink-soft dark:text-starlight-soft">${weather.condition}</p>
            <p class="text-[11px] text-ink-faint dark:text-starlight-faint mt-0.5">
              💧 ${weather.humidity}% · 💨 ${Math.round(weather.windSpeedKmh)} km/h
            </p>
          </div>
          <span class="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent dark:text-gold bg-accent-soft dark:bg-gold/10 px-2 py-1 rounded-full">Live</span>
        </div>
      </div>`;
  }

  return `<div id="weather-widget" class="mb-6">${content}</div>`;
};

export const renderWikiWidget = (
  wiki: WikiSummary | null,
  status: AsyncStatus,
): string => {
  let content = "";

  if (status === "loading") {
    content = `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/40 animate-pulse">
        <div class="flex gap-3">
          <div class="w-20 h-20 shrink-0 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
          <div class="grow space-y-2">
            <div class="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
            <div class="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
            <div class="h-3 w-2/3 bg-slate-200 dark:bg-slate-600 rounded"></div>
          </div>
        </div>
      </div>`;
  } else if (status === "ready" && wiki && wiki.extract) {
    const thumbnail = wiki.thumbnail
      ? `<img src="${wiki.thumbnail}" alt="Wikipedia thumbnail" loading="lazy" class="w-20 h-20 shrink-0 rounded-lg object-cover border border-slate-200/60 dark:border-slate-600/60"/>`
      : "";
    content = `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/40 animate-fade-in-up">
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">About</p>
        <div class="flex gap-3">
          ${thumbnail}
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-5">${wiki.extract}</p>
        </div>
        <a href="${wiki.pageUrl}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-1 mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
          Read more on Wikipedia →
        </a>
      </div>`;
  }
  // idle / error → vacío: el "About" simplemente no aparece

  return `<div id="wiki-widget" class="mt-6">${content}</div>`;
};
