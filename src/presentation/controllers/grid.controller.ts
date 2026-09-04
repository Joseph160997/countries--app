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
  const resultsContainer =
    document.querySelector<HTMLDivElement>("#result-container");

  resultsContainer?.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const target = e.target;

    const btnFav = target.closest(".btn-fav");
    if (btnFav) {
      const id = (btnFav as HTMLElement).dataset.id;
      if (id) toggleCountryFavorite(id);
      return;
    }

    const btnCompare = target.closest(".btn-compare");
    if (btnCompare) {
      return;
    }

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

  resultsContainer?.addEventListener("keydown", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const target = e.target;
    const btnFav = target.closest(".btn-fav");
    const btnCompare = target.closest(".btn-compare");
    if (btnFav || btnCompare) return;

    const card = target.closest(".country-card");
    if (!card) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = (card as HTMLElement).dataset.id;
      if (id) openCountryModal(id);
    }
  });
};
