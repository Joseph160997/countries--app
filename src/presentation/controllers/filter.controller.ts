import {
  setRegionFilter,
  setSort,
  toggleShowFavorites,
} from "@/presentation/state/countryState";
import { isRegion } from "@/domain/country";

/**
 * Controlador de Filtros
 * Inicializa los selectores de región y botones de ordenamiento y favoritos.
 * @returns void
 */
export const initFilterController = (): void => {
  document
    .querySelector<HTMLSelectElement>("#filter-region")
    ?.addEventListener("change", (e) => {
      if (!(e.currentTarget instanceof HTMLSelectElement)) return;
      const value = e.currentTarget.value;
      if (isRegion(value)) setRegionFilter(value);
    });

  document
    .querySelector<HTMLButtonElement>("#sort-area")
    ?.addEventListener("click", () => {
      setSort("area-desc");
    });

  document
    .querySelector<HTMLButtonElement>("#sort-pop")
    ?.addEventListener("click", () => {
      setSort("population-desc");
    });

  document
    .querySelector<HTMLButtonElement>("#sort-name")
    ?.addEventListener("click", () => {
      setSort("name-asc");
    });

  document
    .querySelector<HTMLButtonElement>("#btn-show-favorites")
    ?.addEventListener("click", () => {
      toggleShowFavorites();
    });
};
