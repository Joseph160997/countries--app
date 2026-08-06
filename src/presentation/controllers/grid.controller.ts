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
    .querySelector("#spotlight-container")
    ?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(".btn-spotlight-explore");
      if (btn) {
        const id = (btn as HTMLElement).dataset.id;
        if (id) openCountryModal(id);
      }
    });

  document
    .querySelector<HTMLDivElement>("#result-container")
    ?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      const btnFav = target.closest(".btn-fav");
      if (btnFav) {
        const id = (btnFav as HTMLElement).dataset.id;
        if (id) toggleCountryFavorite(id);
        return;
      }

      // "Go Back Exploring" del empty state de favoritos.
      // Antes este handler también repintaba el botón del header a mano;
      // ahora el renderer lo sincroniza solo en el próximo notify().
      if (target.closest("#btn-empty-state-explore")) {
        toggleShowFavorites();
        return;
      }

      const card = target.closest(".country-card");
      if (card) {
        const id = (card as HTMLElement).dataset.id;
        if (id) openCountryModal(id);
      }
    });
};
