import { openCountryModal } from "@/presentation/state/countryState";

/**
 * Controlador del hero simple.
 * Con un solo país del día, la única interacción relevante es
 * abrir el modal del país cuando el usuario pulsa Explore.
 */
export const initHeroCarousel = (): void => {
  const container = document.querySelector<HTMLElement>("#hero-container");
  if (!container) return;

  container.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const target = e.target;
    const explore = target.closest<HTMLElement>(".btn-hero-explore");

    if (explore?.dataset.id) {
      openCountryModal(explore.dataset.id);
    }
  });
};
