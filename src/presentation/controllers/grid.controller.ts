import {
  openCountryModal,
  toggleCountryFavorite,
  toggleShowFavorites,
} from "@/presentation/state/countryState";

/**
 *  Controlador de Grid
 * Inicializa el contenedor de resultados para manejar clicks en tarjetas y botones.
 * @returns void
 */
export const initGridController = (): void => {
  document
    .querySelector<HTMLDivElement>("#result-container")
    ?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // ─── Botón de favorito ───
      const btnFav = target.closest(".btn-fav");
      if (btnFav) {
        const id = (btnFav as HTMLElement).dataset.id;
        if (id) toggleCountryFavorite(id);
        return;
      }

      // ─── Botón de comparación ───
      // Early return: el comparison.controller se encarga de este click.
      // Sin esto, el click burbujearía hasta el caso de .country-card
      // y abriría el modal accidentalmente.
      const btnCompare = target.closest(".btn-compare");
      if (btnCompare) {
        return;
      }

      // "Go Back Exploring" del empty state
      if (target.closest("#btn-empty-state-explore")) {
        toggleShowFavorites();
        return;
      }

      // Click en la card (no en un botón interno) → abrir modal
      const card = target.closest(".country-card");
      if (card) {
        const id = (card as HTMLElement).dataset.id;
        if (id) openCountryModal(id);
      }
    });
};
