import { openCountryModal } from "@/presentation/state/countryState";

/**
 * Controlador del Hero Carrusel.
 * Rotación automática + navegación manual. El intervalo convive
 * con el renderer: si el hero aún no se renderizó, simplemente espera.
 */
const ROTATE_MS = 6000;
let paused = false;

/** Devuelve todos los slides del carrusel */
const getSlides = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(".hero-slide"));

/** Devuelve el índice del slide actual */
const currentIndex = (container: HTMLElement): number =>
  getSlides(container).findIndex((slide) =>
    slide.classList.contains("is-active"),
  );

/** Muestra el slide indicado */
const showSlide = (container: HTMLElement, index: number): void => {
  const slides = getSlides(container);
  if (slides.length === 0) return;
  const next = ((index % slides.length) + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    const isActive = i === next;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
    if (isActive) {
      slide.removeAttribute("inert");
    } else {
      slide.setAttribute("inert", "");
    }
  });
  container.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === next);
  });
};

export const initHeroCarousel = (): void => {
  const container = document.querySelector<HTMLElement>("#hero-container");
  if (!container) return;

  const slides = getSlides(container);
  if (slides.length <= 1) return;

  // Delegación: explore, dots y flechas
  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const explore = target.closest<HTMLElement>(".btn-hero-explore");
    if (explore?.dataset.id) {
      openCountryModal(explore.dataset.id);
      return;
    }

    const dot = target.closest<HTMLElement>("[data-dot]");
    if (dot?.dataset.dot !== undefined) {
      showSlide(container, Number(dot.dataset.dot));
      return;
    }

    if (target.closest("[data-hero-prev]")) {
      showSlide(container, currentIndex(container) - 1);
      return;
    }
    if (target.closest("[data-hero-next]")) {
      showSlide(container, currentIndex(container) + 1);
    }
  });

  // Pausa al pasar el mouse — el usuario está leyendo
  container.addEventListener("mouseenter", () => {
    paused = true;
  });
  container.addEventListener("mouseleave", () => {
    paused = false;
  });

  // Rotación automática — se salta si el hero aún no existe
  window.setInterval(() => {
    if (paused || getSlides(container).length === 0) return;
    showSlide(container, currentIndex(container) + 1);
  }, ROTATE_MS);
};
