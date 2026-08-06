import type { Country } from "@/domain/country";
import { getRegionBadgeClasses } from "./countryCards";

/**
 * Spotlight: País del Día.
 * Teaser determinista que abre la aplicación e invita a explorar.
 */
export const renderSpotlight = (country: Country): string => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return `
  <section class="mb-12 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-starlight-faint/10 bg-paper-card dark:bg-space-card shadow-xl shadow-slate-200/40 dark:shadow-none animate-fade-in-up">
    <div class="flex flex-col md:flex-row">
      <div class="relative md:w-2/5 h-56 md:h-auto overflow-hidden bg-paper-deep dark:bg-space-deep">
        <img src="${country.flag}" alt="Flag of ${country.name}" loading="lazy" class="w-full h-full object-cover"/>
        <span class="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-ink/85 dark:bg-space-deep/85 text-starlight backdrop-blur-sm">
          Country of the Day
        </span>
      </div>
      <div class="md:w-3/5 p-6 lg:p-10 flex flex-col justify-center">
        <p class="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent dark:text-gold mb-3">${today}</p>
        <h2 class="font-display text-3xl lg:text-5xl font-extrabold tracking-tight text-ink dark:text-starlight mb-5">${country.name}</h2>
        <div class="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRegionBadgeClasses(country.region)}">
            ${country.region}
          </span>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ink-faint dark:text-starlight-faint">Capital</span>
            <span class="font-mono text-sm font-semibold text-ink dark:text-starlight">${country.capital}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ink-faint dark:text-starlight-faint">Population</span>
            <span class="font-mono text-sm font-semibold text-ink dark:text-starlight">${country.population.toLocaleString()}</span>
          </div>
        </div>
        <div>
          <button
            data-id="${country.cca3}"
            class="btn-spotlight-explore inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 dark:bg-gold dark:hover:bg-gold-soft dark:text-space text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
          >
            Explore <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  </section>
  `;
};

/** Placeholder mientras cargan los países. */
export const renderSpotlightSkeleton = (): string => `
  <div class="mb-12 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white dark:bg-slate-800/50">
    <div class="flex flex-col md:flex-row animate-pulse">
      <div class="md:w-2/5 h-56 md:h-auto bg-slate-200 dark:bg-slate-700"></div>
      <div class="md:w-3/5 p-6 lg:p-10 space-y-4">
        <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-10 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-12 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl mt-6"></div>
      </div>
    </div>
  </div>
`;
