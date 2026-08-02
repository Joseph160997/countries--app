import {
  closeCountryModal,
  getSelectedCountry,
  openCountryModal,
} from "@/presentation/state/countryState";

/**
 * Controlador de Modal
 * Inicializa el contenedor del modal para manejar clicks en el backdrop, botones de cierre y chips de países fronterizos.
 * @returns void
 */
export const initModalController = (): void => {
  const modalContainer =
    document.querySelector<HTMLDivElement>("#modal-container");

  modalContainer?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // Click en el backdrop (fuera de la tarjeta)
    if (e.target === modalContainer) {
      closeCountryModal();
      return;
    }

    // Navegación entre países fronterizos
    const borderChip = target.closest(".border-chip");
    if (borderChip) {
      const nextCca3 = (borderChip as HTMLElement).dataset.cca3;
      if (nextCca3) openCountryModal(nextCca3);
      return;
    }

    if (target.closest("#close-modal")) {
      closeCountryModal();
    }
  });

  // ⌨️ ESC cierra el modal — finding de accesibilidad de la Fase 0, resuelto.
  // El guard evita repintados inútiles cuando no hay modal abierto.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && getSelectedCountry()) {
      closeCountryModal();
    }
  });
};
