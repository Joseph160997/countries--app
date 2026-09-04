import type { Country } from "@/domain/country";
import type { WeatherData } from "@/domain/weather";
import type { WikiSummary } from "@/domain/wiki";
import type { AsyncStatus } from "@/presentation/slices/modal.slice";
import { escapeHtml, sanitizeUrl } from "../utils";

export const getRegionBadgeClasses = (region: string): string => {
  const classes: Record<string, string> = {
    Africa: "bg-region-africa/10 text-region-africa",
    Americas: "bg-region-americas/10 text-region-americas",
    Asia: "bg-region-asia/10 text-region-asia",
    Europe: "bg-region-europe/10 text-region-europe",
    Oceania: "bg-region-oceania/10 text-region-oceania",
  };
  return (
    classes[region] ??
    "bg-ink-faint/10 text-ink-soft dark:bg-starlight-faint/15 dark:text-starlight-soft"
  );
};

/** Color de acento por región — la "pestaña de atlas". */
export const getRegionAccentClass = (region: string): string => {
  const accents: Record<string, string> = {
    Africa: "bg-region-africa",
    Americas: "bg-region-americas",
    Asia: "bg-region-asia",
    Europe: "bg-region-europe",
    Oceania: "bg-region-oceania",
  };
  return accents[region] ?? "bg-ink-faint dark:bg-starlight-faint";
};

/**
 * Componente funcional puro que genera el HTML de una tarjeta de país.
 * @param country - Objeto con los datos del país a renderizar.
 * @returns String de HTML estructurado con Tailwind CSS.
 */
export const renderCountryCard = (
  country: Country,
  comparisonCodes: readonly string[] = [],
): string => {
  const isInComparison = comparisonCodes.includes(country.cca3);
  const safeName = escapeHtml(country.name);
  const safeCapital = escapeHtml(country.capital);
  const safeRegion = escapeHtml(country.region);
  const safeCca3 = escapeHtml(country.cca3);

  const safeFlagSrc = escapeHtml(sanitizeUrl(country.flag));

  return `
<article data-id="${safeCca3}" tabindex="0" role="button" aria-label="Open country ${safeName}" class="country-card bg-paper-card dark:bg-space-card rounded-xl border border-slate-200/60 dark:border-starlight-faint/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">
  <!-- Pestaña de atlas: identidad de región -->
  <div class="h-1 ${getRegionAccentClass(country.region)}"></div>

  <!-- Bandera + etiqueta cartográfica -->
<div class="overflow-hidden h-40 bg-paper-deep dark:bg-space-deep relative aspect-3/2">
    <img src="${safeFlagSrc}" alt="Flag of ${safeName}" loading="lazy" width="378" height="160" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
    <span class="absolute bottom-2 left-2 font-mono text-[10px] font-bold tracking-wider bg-ink/75 dark:bg-space-deep/85 text-starlight px-2 py-0.5 rounded backdrop-blur-sm">${safeCca3}</span>
  </div>

  <div class="p-5 grow flex flex-col justify-between">
    <div>
      <h3 class="font-display text-lg font-bold text-ink dark:text-starlight tracking-tight mb-1 group-hover:text-accent dark:group-hover:text-gold transition-colors">
        ${safeName}
      </h3>
      <p class="text-xs text-ink-faint dark:text-starlight-faint mb-4">
        Capital · <span class="font-medium text-ink-soft dark:text-starlight-soft">${safeCapital}</span>
      </p>

      <!-- Mini-stats: los números siempre en mono -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-paper-deep/70 dark:bg-space-deep/70 rounded-lg px-3 py-2">
          <p class="text-[9px] font-bold uppercase tracking-wider text-ink-faint dark:text-starlight-faint mb-0.5">Population</p>
          <p class="font-mono text-[11px] font-bold text-ink dark:text-starlight">${country.population.toLocaleString()}</p>
        </div>
        <div class="bg-paper-deep/70 dark:bg-space-deep/70 rounded-lg px-3 py-2">
          <p class="text-[9px] font-bold uppercase tracking-wider text-ink-faint dark:text-starlight-faint mb-0.5">Area</p>
          <p class="font-mono text-[11px] font-bold text-ink dark:text-starlight">${country.areaKm2 ? `${country.areaKm2.toLocaleString()} km²` : "N/A"}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-starlight-faint/10">
      <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft dark:text-starlight-soft">
        <span class="w-2 h-2 rounded-full ${getRegionAccentClass(country.region)}"></span>
        ${safeRegion}
      </span>
      <div class="flex items-center gap-1.5">
  <button data-id="${safeCca3}" aria-label="Compare ${safeName}" class="btn-compare p-1 text-sm transition-transform duration-200 cursor-pointer ${isInComparison ? "opacity-100 scale-110" : "opacity-50 hover:opacity-100"}" title="Compare">
    ⚖️
  </button>
  <button data-id="${safeCca3}" aria-label="Toggle favorite for ${safeName}" class="btn-fav text-lg hover:scale-110 transition-transform duration-200 cursor-pointer p-1">
    ${country.isFavorite ? "❤️" : "🤍"}
  </button>
</div>
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
    items.length > 0 ? items.map((item) => escapeHtml(item)).join(", ") : "N/A";

  const formattedLanguages = formatArray(country.languages);
  const formattedCurrencies = formatArray(country.currencies);
  const formattedTld = formatArray(country.tld);
  const capital = country.capital || "N/A";
  const subregion = escapeHtml(country.subregion || "N/A");
  const population = country.population?.toLocaleString() ?? "N/A";

  const bordersHTML =
    borderNames.length > 0
      ? borderNames
          .map((name, index) => {
            const borderCode = country.borders?.[index] ?? "";

            return `
              <span
                class="border-chip inline-block px-3 py-1.5 bg-accent-soft dark:bg-gold/10 text-accent dark:text-gold rounded-full text-xs font-semibold transition-colors cursor-pointer hover:bg-accent hover:text-white dark:hover:bg-gold dark:hover:text-space"
                data-cca3="${escapeHtml(borderCode)}"
              >
                ${escapeHtml(name.trim())}
              </span>
            `;
          })
          .join("")
      : `<span class="text-ink-faint dark:text-starlight-faint italic text-sm">No border countries</span>`;

  const safeFlagSrc = escapeHtml(sanitizeUrl(country.flag));

  return `
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-modal-title"
      aria-label="Country details for ${escapeHtml(country.name)}"
      class="relative w-full max-w-5xl max-h-[95vh] bg-paper-card dark:bg-space-card rounded-2xl shadow-2xl shadow-slate-300/50 dark:shadow-space-deep border border-slate-200/60 dark:border-starlight-faint/15 animate-fade-in-up flex flex-col overflow-hidden"
    >
      <!-- Pestaña de región -->
      <div class="h-1.5 shrink-0 ${getRegionAccentClass(country.region)}"></div>

      <!-- Botón cerrar -->
      <button
        id="close-modal"
        aria-label="Close modal"
        class="absolute top-4 right-4 z-30 p-2 rounded-full bg-paper-card/90 dark:bg-space-deep/90 hover:bg-accent-soft dark:hover:bg-gold/20 text-ink-soft dark:text-starlight-soft transition-colors cursor-pointer backdrop-blur-sm shadow-md"
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

      <!--
        Contenedor principal.
        En móvil el modal completo hace scroll.
      -->
      <div class="min-h-0 flex-1 overflow-y-auto">
        <div class="flex flex-col md:flex-row">

          <!-- ═══ COLUMNA IZQUIERDA: bandera + enlaces ═══ -->
          <div
            class="md:w-2/5 shrink-0 p-5 sm:p-6 lg:p-8 flex flex-col bg-paper-deep/40 dark:bg-space-deep/40"
          >
            <!-- Bandera grande -->
            <div
              class="relative w-full rounded-xl overflow-hidden border border-slate-200/60 dark:border-starlight-faint/15 shadow-md bg-paper-card dark:bg-space-card"
            >
              <img
                src="${safeFlagSrc}"
                alt="Flag of ${escapeHtml(country.name)}"
                width="378"
                height="160"
                loading="eager"
                class="modal-flag block w-full h-auto min-h-45 sm:min-h-55 md:min-h-65 lg:min-h-75 object-contain"
              />
            </div>

            <!-- Código del país -->
            <div class="text-center mt-3">
              <span
                class="inline-block font-mono text-[11px] font-bold tracking-wider bg-ink/80 dark:bg-space-deep text-starlight px-3 py-1 rounded"
              >
                ${escapeHtml(country.cca3)}
              </span>
            </div>

            <!-- Links externos -->
            <div class="mt-4">
              ${renderSideLinks(country)}
            </div>
          </div>

          <!-- ═══ COLUMNA DERECHA: contenido ═══ -->
          <div
            class="md:w-3/5 min-w-0 p-5 sm:p-6 lg:p-8"
          >
            <h2
              id="country-modal-title"
              class="font-display text-2xl lg:text-3xl font-extrabold text-ink dark:text-starlight tracking-tight mb-3 pr-8"
            >
              ${escapeHtml(country.name)}
            </h2>

            <div class="flex flex-wrap items-center gap-2 mb-6">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRegionBadgeClasses(country.region)}"
              >
                ${escapeHtml(country.region)}
              </span>

              <span class="text-sm text-ink-soft dark:text-starlight-soft">
                ${subregion}
              </span>
            </div>

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
                <p
                  class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1"
                >
                  Top Level Domain
                </p>

                <p
                  class="font-mono text-sm bg-paper-deep dark:bg-space-deep px-2 py-1 rounded truncate"
                >
                  ${formattedTld}
                </p>
              </div>

              <div>
                <p
                  class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1"
                >
                  Currencies
                </p>

                <p class="font-medium text-ink dark:text-starlight">
                  ${formattedCurrencies}
                </p>
              </div>

              <div>
                <p
                  class="text-xs font-semibold text-ink-faint dark:text-starlight-faint uppercase tracking-wider mb-1"
                >
                  Languages
                </p>

                <p class="font-medium text-ink dark:text-starlight">
                  ${formattedLanguages}
                </p>
              </div>
            </div>

            <div
              class="mt-8 pt-6 border-t border-slate-200/50 dark:border-starlight-faint/15"
            >
              <h4
                class="text-sm font-bold text-ink dark:text-starlight mb-3"
              >
                Border Countries
              </h4>

              <div class="flex flex-wrap gap-2">
                ${bordersHTML}
              </div>
            </div>

            ${renderWikiWidget(wiki, wikiStatus)}
          </div>
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

/**
 * Links externos apilados en la columna izquierda del modal (debajo de la bandera).
 * Estilo "carnet": botones de ancho completo con icono y flecha.
 */
const renderSideLinks = (country: Country): string => {
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
    .map((item) => {
      const safeHref = escapeHtml(sanitizeUrl(item.href));

      return `
      <a href="${safeHref}" target="_blank" rel="noopener noreferrer"
         class="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-paper-card dark:bg-space-card hover:bg-accent hover:text-white dark:hover:bg-gold dark:hover:text-space text-ink dark:text-starlight text-xs font-bold transition-all border border-slate-200/60 dark:border-starlight-faint/15 hover:border-accent dark:hover:border-gold">
        <span class="flex items-center gap-2"><span>${item.icon}</span> ${escapeHtml(item.label)}</span>
        <span aria-hidden="true" class="opacity-50">→</span>
      </a>
    `;
    })
    .join("");

  return `
    <div class="mt-auto pt-2 border-t border-slate-200/50 dark:border-starlight-faint/10">
      <p class="text-[10px] font-bold uppercase tracking-wider text-ink-faint dark:text-starlight-faint mb-2">Explore more</p>
      <div class="flex flex-col gap-2">${buttons}</div>
    </div>
  `;
};

export const renderWeatherWidget = (
  weather: WeatherData | null,
  status: AsyncStatus,
  capital: string,
): string => {
  let content = "";
  const safeCapital = escapeHtml(capital);

  if (status === "loading") {
    content = `
      <div class="p-4 rounded-xl bg-paper-deep dark:bg-space-deep/60 border border-slate-200/60 dark:border-starlight-faint/10 animate-pulse">
        <div class="h-4 w-1/2 bg-slate-200 dark:bg-space-deep rounded mb-2"></div>
        <div class="h-3 w-2/3 bg-slate-200 dark:bg-space-deep rounded"></div>
      </div>`;
  } else if (status === "error" || !weather) {
    content = `
      <div class="p-3 rounded-xl bg-paper-deep dark:bg-space-deep/40 text-xs text-ink-faint dark:text-starlight-faint italic">
        Weather unavailable for ${safeCapital}
      </div>`;
  } else {
    const safeIcon = escapeHtml(weather.icon);

    content = `
      <div class="p-4 rounded-xl bg-linear-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-space-deep border border-sky-100 dark:border-sky-900/30">
        <div class="flex items-center gap-4">
          <span class="text-4xl">${safeIcon}</span>
          <div class="min-w-0">
            <p class="text-xl font-bold text-ink dark:text-starlight">
              ${Math.round(weather.temperatureC)}°C
              <span class="text-sm font-semibold text-ink-soft dark:text-starlight-soft">in ${safeCapital}</span>
            </p>
            <p class="text-xs font-semibold text-ink-soft dark:text-starlight-soft">${escapeHtml(weather.condition)}</p>
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
    const safeExtract = escapeHtml(wiki.extract);
    const safePageUrl = escapeHtml(sanitizeUrl(wiki.pageUrl));
    const safeThumbnail = wiki.thumbnail
      ? escapeHtml(sanitizeUrl(wiki.thumbnail))
      : "";
    const thumbnail = safeThumbnail
      ? `<img src="${safeThumbnail}" alt="Wikipedia thumbnail" loading="lazy" class="w-20 h-20 shrink-0 rounded-lg object-cover border border-slate-200/60 dark:border-slate-600/60"/>`
      : "";
    content = `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/40 animate-fade-in-up">
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">About</p>
        <div class="flex gap-3">
          ${thumbnail}
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-5">${safeExtract}</p>
        </div>
        <a href="${safePageUrl}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-1 mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
          Read more on Wikipedia →
        </a>
      </div>`;
  }
  // idle / error → vacío: el "About" simplemente no aparece

  return `<div id="wiki-widget" class="mt-6">${content}</div>`;
};
