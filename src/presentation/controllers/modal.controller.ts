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

    if (e.target === modalContainer) {
      closeCountryModal();
      return;
    }

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && getSelectedCountry()) {
      closeCountryModal();
      return;
    }

    if (!getSelectedCountry()) return;

    const dialog = document.querySelector<HTMLElement>(
      "#modal-container [role='dialog']",
    );
    if (!dialog) return;

    if (e.key !== "Tab") return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusable.length === 0) {
      e.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (e.shiftKey && activeElement === first) {
      e.preventDefault();
      last.focus();
      return;
    }

    if (!e.shiftKey && activeElement === last) {
      e.preventDefault();
      first.focus();
      return;
    }

    if (!activeElement || !dialog.contains(activeElement)) {
      e.preventDefault();
      first.focus();
    }
  });
};
