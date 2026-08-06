import {
  getBorderNames,
  getCountries,
  getFilteredTotal,
  getIsLoading,
  getSelectedCountry,
  getSort,
  isShowingFavoritesActive,
  subscribe,
  getWeather,
  getWeatherStatus,
  getWikiStatus,
  getWiki,
  getTotalPages,
  getCurrentPage,
  getHeroSlides,
} from "@/presentation/state/countryState";
import {
  renderCountryCard,
  renderCountryDetailModal,
  renderWeatherWidget,
  renderWikiWidget,
} from "@/presentation/components/countryCards";
import { renderEmptyStateCard } from "@/presentation/components/emptyState";
import { renderSkeletonGrid } from "@/presentation/components/skeleton";
import { getFavoriteCodes } from "@/presentation/services/favoriteService";
import { unwrapOr } from "@/shared/result";
import { renderPagination } from "../components/pagination";
import { renderHero, renderHeroSkeleton } from "@/presentation/components/hero";

// ========================================================
// ELEMENTOS DEL DOM (capturados en initRenderer, no al importar)
// ========================================================
let resultsContainer: HTMLDivElement | null = null;
let modalContainer: HTMLDivElement | null = null;
let favsCounter: HTMLSpanElement | null = null;
let btnShowFavorites: HTMLButtonElement | null = null;
let btnSortPop: HTMLButtonElement | null = null;
let btnSortName: HTMLButtonElement | null = null;
let btnSortArea: HTMLButtonElement | null = null;

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
const SORT_ACTIVE = [
  "bg-accent",
  "dark:bg-gold",
  "text-white",
  "dark:text-space",
  "border-accent",
  "dark:border-gold",
];
const SORT_INACTIVE = [
  "bg-paper-deep",
  "dark:bg-space-deep",
  "text-ink-soft",
  "dark:text-starlight-soft",
];

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

const renderPaginationSection = (): void => {
  const container = document.getElementById("pagination-container");
  if (!container) return;

  if (getIsLoading()) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = renderPagination({
    currentPage: getCurrentPage(),
    totalPages: getTotalPages(),
    totalResults: getFilteredTotal(),
  });
};

let lastModalCca3: string | null = null;

const renderModal = (): void => {
  if (!modalContainer) return;
  const selected = getSelectedCountry();

  if (!selected) {
    lastModalCca3 = null;
    modalContainer.classList.add("hidden");
    modalContainer.classList.remove("flex");
    document.body.style.overflow = "auto";
    return;
  }

  // Sigue abierto el MISMO país → solo cambió el clima.
  // Parcheamos únicamente el widget: sin re-animación, sin recargar la bandera.
  if (lastModalCca3 === selected.cca3) {
    const weatherWidget = document.getElementById("weather-widget");
    if (weatherWidget) {
      weatherWidget.outerHTML = renderWeatherWidget(
        getWeather(),
        getWeatherStatus(),
        selected.capital,
      );
    }
    const wikiWidget = document.getElementById("wiki-widget");
    if (wikiWidget) {
      wikiWidget.outerHTML = renderWikiWidget(getWiki(), getWikiStatus());
    }
    return;
  }

  // País nuevo (o primera apertura) → render completo
  lastModalCca3 = selected.cca3;
  const borderNames = getBorderNames(selected.borders);
  modalContainer.innerHTML = renderCountryDetailModal(
    selected,
    borderNames,
    getWeather(),
    getWeatherStatus(),
    getWiki(),
    getWikiStatus(),
  );
  modalContainer.classList.remove("hidden");
  modalContainer.classList.add("flex");
  document.body.style.overflow = "hidden";
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

  syncButtonState(
    btnSortArea,
    sort === "area-desc",
    SORT_ACTIVE,
    SORT_INACTIVE,
  );

  syncButtonState(btnSortName, sort === "name-asc", SORT_ACTIVE, SORT_INACTIVE);
};

let heroRendered = false;

const renderHeroSection = (): void => {
  const container = document.getElementById("hero-container");
  if (!container || heroRendered) return;

  if (getIsLoading()) {
    container.innerHTML = renderHeroSkeleton();
    return;
  }

  const slides = getHeroSlides();
  if (slides.length === 0) return;

  container.innerHTML = renderHero(slides);
  heroRendered = true;
};

const renderUI = (): void => {
  renderGrid();
  renderPaginationSection();
  renderModal();
  renderHeaderWidgets();
  renderHeroSection();
};

// ========================================================
// INICIALIZACIÓN
// ========================================================
export const initRenderer = (): void => {
  resultsContainer = document.querySelector("#result-container");
  modalContainer = document.querySelector("#modal-container");
  favsCounter = document.querySelector("#favs-count-display");
  btnShowFavorites = document.querySelector("#btn-show-favorites");
  btnSortPop = document.querySelector("#sort-pop");
  btnSortName = document.querySelector("#sort-name");
  btnSortArea = document.querySelector("#sort-area");

  // La única suscripción de toda la app: notify() → repintado completo
  subscribe(renderUI);
};
