import {
  getBorderNames,
  getCountries,
  getFilteredTotal,
  getIsLoading,
  getSelectedCountry,
  getSort,
  hasMore,
  isShowingFavoritesActive,
  subscribe,
} from "@/presentation/state/countryState";
import {
  renderCountryCard,
  renderCountryDetailModal,
} from "@/presentation/components/countryCards";
import { renderEmptyStateCard } from "@/presentation/components/emptyState";
import { renderSkeletonGrid } from "@/presentation/components/skeleton";
import { getFavoriteCodes } from "@/presentation/services/favoriteService";
import { unwrapOr } from "@/shared/result";

// ========================================================
// ELEMENTOS DEL DOM (capturados en initRenderer, no al importar)
// ========================================================
let resultsContainer: HTMLDivElement | null = null;
let resultsCountEl: HTMLParagraphElement | null = null;
let loadMoreContainer: HTMLDivElement | null = null;
let modalContainer: HTMLDivElement | null = null;
let favsCounter: HTMLSpanElement | null = null;
let btnShowFavorites: HTMLButtonElement | null = null;
let btnSortPop: HTMLButtonElement | null = null;
let btnSortName: HTMLButtonElement | null = null;

// ========================================================
// VOCABULARIO VISUAL (clases como datos, no esparcidas en handlers)
// ========================================================
const FAVS_ACTIVE = [
  "bg-rose-600",
  "dark:bg-rose-700",
  "text-white",
  "dark:text-white",
  "border-rose-600",
  "dark:border-rose-700",
];
const FAVS_INACTIVE = [
  "bg-rose-50",
  "dark:bg-rose-950/30",
  "text-rose-600",
  "dark:text-rose-400",
  "border-rose-100",
  "dark:border-rose-900/40",
];
const SORT_ACTIVE = ["bg-blue-600", "text-white", "border-blue-600"];
const SORT_INACTIVE = ["bg-slate-100", "dark:bg-slate-800", "text-slate-700"];

/** Sincroniza la apariencia de un botón con un booleano de estado. */
const syncButtonState = (
  btn: HTMLElement | null,
  isActive: boolean,
  activeClasses: string[],
  inactiveClasses: string[],
): void => {
  if (!btn) return;
  btn.classList.remove(...(isActive ? inactiveClasses : activeClasses));
  btn.classList.add(...(isActive ? activeClasses : inactiveClasses));
};

// ========================================================
// RENDERIZADO — cada función pinta UN aspecto del estado
// ========================================================
const renderGrid = (): void => {
  if (!resultsContainer) return;

  if (getIsLoading()) {
    resultsContainer.innerHTML = renderSkeletonGrid(20);
    return;
  }

  const visible = getCountries();
  if (visible.length === 0) {
    const isFavsView = isShowingFavoritesActive();
    resultsContainer.innerHTML = renderEmptyStateCard(
      isFavsView
        ? {
            title: "Your favorites list is empty",
            description:
              "You haven't marked any countries yet. Click the heart icon!",
          }
        : {
            title: "No countries found",
            description:
              "We couldn't find any country matching your search. Try another name.",
            showButton: false,
          },
    );
    return;
  }

  resultsContainer.innerHTML = visible.map(renderCountryCard).join("");
};

const renderResultsMeta = (): void => {
  if (getIsLoading()) {
    if (resultsCountEl) resultsCountEl.textContent = "";
    if (loadMoreContainer) loadMoreContainer.classList.add("hidden");
    return;
  }

  const visible = getCountries().length;
  const total = getFilteredTotal();
  if (resultsCountEl) {
    resultsCountEl.textContent =
      visible > 0 ? `Showing ${visible} of ${total} countries` : "";
  }
  if (loadMoreContainer) {
    loadMoreContainer.classList.toggle("hidden", !hasMore());
  }
};

const renderModal = (): void => {
  if (!modalContainer) return;
  const selected = getSelectedCountry();

  if (selected) {
    // borders es string[] por contrato del modelo — el `|| []` defensivo
    // del código anterior era ruido: el mapper garantiza el array.
    const borderNames = getBorderNames(selected.borders);
    modalContainer.innerHTML = renderCountryDetailModal(selected, borderNames);
    modalContainer.classList.remove("hidden");
    modalContainer.classList.add("flex");
    document.body.style.overflow = "hidden";
  } else {
    modalContainer.classList.add("hidden");
    modalContainer.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
};

const renderHeaderWidgets = (): void => {
  if (favsCounter) {
    favsCounter.textContent = unwrapOr(
      getFavoriteCodes(),
      [],
    ).length.toString();
  }
  // Todo se DERIVA del estado — ningún handler toca estas clases ya
  syncButtonState(
    btnShowFavorites,
    isShowingFavoritesActive(),
    FAVS_ACTIVE,
    FAVS_INACTIVE,
  );
  const sort = getSort();
  syncButtonState(
    btnSortPop,
    sort === "population-desc",
    SORT_ACTIVE,
    SORT_INACTIVE,
  );
  syncButtonState(btnSortName, sort === "name-asc", SORT_ACTIVE, SORT_INACTIVE);
};

const renderUI = (): void => {
  renderGrid();
  renderResultsMeta();
  renderModal();
  renderHeaderWidgets();
};

// ========================================================
// INICIALIZACIÓN
// ========================================================
export const initRenderer = (): void => {
  resultsContainer = document.querySelector("#result-container");
  resultsCountEl = document.querySelector("#results-count");
  loadMoreContainer = document.querySelector("#load-more-container");
  modalContainer = document.querySelector("#modal-container");
  favsCounter = document.querySelector("#favs-count-display");
  btnShowFavorites = document.querySelector("#btn-show-favorites");
  btnSortPop = document.querySelector("#sort-pop");
  btnSortName = document.querySelector("#sort-name");

  // La única suscripción de toda la app: notify() → repintado completo
  subscribe(renderUI);
};
