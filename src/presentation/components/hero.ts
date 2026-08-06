import type { HeroSlide } from "../slices/explorer.selectors";

/**
 * Hero Carrusel — la apertura de Terra.
 * Todos los slides se renderizan apilados; el controller
 * alterna la clase .is-active y el CSS hace el crossfade + zoom.
 * Nota: el contenido vive SIEMPRE sobre fondo oscuro (gradiente),
 * así que usa colores fijos sin variantes dark:.
 */
export const renderHero = (slides: HeroSlide[]): string => {
  const slidesHTML = slides
    .map((slide, index) => {
      const { country } = slide;
      return `
      <div class="hero-slide absolute inset-0 ${index === 0 ? "is-active" : ""}" data-slide="${index}" aria-hidden="${index !== 0}">
        <img src="${country.flag}" alt="Flag of ${country.name}" loading="${index === 0 ? "eager" : "lazy"}" class="hero-flag absolute inset-0 w-full h-full object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/10 dark:from-space-deep/95 dark:via-space-deep/55 dark:to-space-deep/10"></div>

        <div class="absolute inset-x-0 bottom-0 p-6 md:p-10 max-w-3xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-gold text-space mb-4 shadow-md">
            ★ ${slide.badge}
          </span>
          <h2 class="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-starlight mb-3">${country.name}</h2>
          <p class="text-sm md:text-base text-starlight/85 max-w-xl mb-6 leading-relaxed">${slide.tagline}</p>

          <div class="flex flex-wrap items-center gap-4">
            <button
              data-id="${country.cca3}"
              class="btn-hero-explore inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold-soft text-space font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 hover:-translate-y-0.5"
            >
              Explore <span aria-hidden="true">→</span>
            </button>
            <div class="flex items-center gap-3 font-mono text-xs text-starlight/75">
              <span>${country.capital}</span>
              <span class="text-starlight/40">·</span>
              <span>${country.population.toLocaleString()} people</span>
            </div>
          </div>
        </div>
      </div>
      `;
    })
    .join("");

  const dotsHTML = slides
    .map(
      (_, index) => `
      <button data-dot="${index}" class="hero-dot ${index === 0 ? "is-active" : ""}" aria-label="Go to slide ${index + 1}"></button>
    `,
    )
    .join("");

  return `
  <div class="relative h-[440px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50 dark:shadow-space-deep border border-slate-200/60 dark:border-starlight-faint/10 bg-space-deep">
    ${slidesHTML}

    <button data-hero-prev aria-label="Previous slide"
      class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-space-deep/50 hover:bg-gold hover:text-space text-starlight backdrop-blur-sm border border-starlight/20 flex items-center justify-center transition-all cursor-pointer opacity-60 hover:opacity-100">
      ←
    </button>
    <button data-hero-next aria-label="Next slide"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-space-deep/50 hover:bg-gold hover:text-space text-starlight backdrop-blur-sm border border-starlight/20 flex items-center justify-center transition-all cursor-pointer opacity-60 hover:opacity-100">
      →
    </button>

    <div class="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-2">
      ${dotsHTML}
    </div>
  </div>
  `;
};

/** Placeholder mientras cargan los países. */
export const renderHeroSkeleton = (): string => `
  <div class="h-[440px] md:h-[520px] rounded-3xl bg-paper-deep dark:bg-space-deep animate-pulse border border-slate-200/60 dark:border-starlight-faint/10"></div>
`;
