import type { HeroSlide } from "../slices/explorer.selectors";
import { escapeHtml, sanitizeUrl } from "../utils";

/**
 * Hero Carrusel — la apertura de Terra.
 * Todos los slides se renderizan apilados; el controller
 * alterna la clase .is-active y el CSS hace el crossfade + zoom.
 * Nota: el contenido vive SIEMPRE sobre fondo oscuro (gradiente),
 * así que usa colores fijos sin variantes dark:.
 */
export const renderHero = (slides: HeroSlide[]): string => {
  const [slide] = slides;
  if (!slide) return "";

  const { country } = slide;

  const safeFlagSrc = escapeHtml(sanitizeUrl(country.flag));
  const safeName = escapeHtml(country.name);
  const safeBadge = escapeHtml(slide.badge);
  const safeTagline = escapeHtml(slide.tagline);
  const safeCapital = escapeHtml(country.capital);
  const safeCca3 = escapeHtml(country.cca3);

  return `
  <div class="relative h-110 md:h-130 rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50 dark:shadow-space-deep border border-slate-200/60 dark:border-starlight-faint/10 bg-space-deep">
    <div class="hero-slide absolute inset-0 is-active" data-slide="0" aria-hidden="false">
      <img src="${safeFlagSrc}" alt="Flag of ${safeName}"
           loading="eager"
           fetchpriority="high"
           class="hero-flag absolute inset-0 w-full h-full object-cover"/>
      <div class="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/45 to-ink/10 dark:from-space-deep/95 dark:via-space-deep/55 dark:to-space-deep/10"></div>

      <div class="absolute inset-x-0 bottom-0 p-6 md:p-10 max-w-3xl">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-gold text-space mb-4 shadow-md">
          ★ ${safeBadge}
        </span>
        <h2 class="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-starlight mb-3">${safeName}</h2>
        <p class="text-sm md:text-base text-starlight/85 max-w-xl mb-6 leading-relaxed">${safeTagline}</p>

        <div class="flex flex-wrap items-center gap-4">
          <button
            data-id="${safeCca3}"
            class="btn-hero-explore inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold-soft text-space font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 hover:-translate-y-0.5"
          >
            Explore <span aria-hidden="true">→</span>
          </button>
          <div class="flex items-center gap-3 font-mono text-xs text-starlight/75">
            <span>${safeCapital}</span>
            <span class="text-starlight/40">·</span>
            <span>${country.population.toLocaleString()} people</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
};
