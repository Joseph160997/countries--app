import "./style.css";
import { initializeLayout } from "./components/layout";
import {
  subscribe,
  getCountries,
  loadCountries,
  setSearchQuery,
  isShowingFavoritesActive,
  setRegionFilter,
  setSort,
  closeCountryModal,
  openCountryModal,
  getBorderNames,
  getSelectedCountry,
  toggleCountryFavorite,
  toggleShowFavorites,
  initSort,
  getSort,
  loadMore,
  hasMore,
  getFilteredTotal,
  getIsLoading,
} from "./state/countryState";
import { debounce } from "./utils/debounce";
import { renderSkeletonGrid } from "./components/skeleton";
import {
  renderCountryCard,
  renderCountryDetailModal,
} from "./components/countryCards";
import { getFavoriteCodes } from "./services/favoriteService";
import { renderEmptyStateCard } from "./components/emptyState";
import { toggleTheme, initTheme } from "./services/themeService";
import type { Region } from "./types/Country";

// ========================================================
// 1. INICIALIZACIÓN DE LA INTERFAZ (DOM Dinámico)
// ========================================================
initializeLayout("app");

// ========================================================
// 2. CAPTURA DE ELEMENTOS DEL DOM
// ========================================================
const resultsContainer =
  document.querySelector<HTMLDivElement>("#result-container");
const inputSearch = document.querySelector<HTMLInputElement>("#search-input");
const favsCounter = document.querySelector<HTMLSpanElement>(
  "#favs-count-display",
);
const btnShowFavorites = document.querySelector<HTMLButtonElement>(
  "#btn-show-favorites",
);
const btnTheme = document.querySelector<HTMLButtonElement>("#theme-toggle");
const btnSortPop = document.querySelector<HTMLButtonElement>("#sort-pop");
const btnSortName = document.querySelector<HTMLButtonElement>("#sort-name");
const selectRegion =
  document.querySelector<HTMLSelectElement>("#filter-region");
const modalContainer =
  document.querySelector<HTMLDivElement>("#modal-container");
const loadMoreContainer = document.querySelector<HTMLDivElement>(
  "#load-more-container",
);
const resultsCountEl =
  document.querySelector<HTMLParagraphElement>("#results-count");

// ========================================================
// 3. CAPA DE RENDERIZADO
// ========================================================
const renderUI = (): void => {
  if (!resultsContainer) return;

  //  Si está cargando, mostramos skeletons y salimos
  if (getIsLoading()) {
    resultsContainer.innerHTML = renderSkeletonGrid(20);

    // Ocultamos el contador y el load more mientras carga
    if (resultsCountEl) resultsCountEl.textContent = "";
    if (loadMoreContainer) loadMoreContainer.classList.add("hidden");
    return;
  }

  // --- GRILLA ---
  const countriesToRender = getCountries();

  if (countriesToRender.length === 0) {
    const isFavsView = isShowingFavoritesActive();
    const config = isFavsView
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
        };
    resultsContainer.innerHTML = renderEmptyStateCard(config);
  } else {
    resultsContainer.innerHTML = countriesToRender
      .map(renderCountryCard)
      .join("");
  }

  // --- CONTADOR Y LOAD MORE ---
  if (resultsCountEl) {
    const visible = countriesToRender.length;
    const total = getFilteredTotal();
    resultsCountEl.textContent =
      visible > 0 ? `Showing ${visible} of ${total} countries` : "";
  }

  if (loadMoreContainer) {
    if (hasMore()) {
      loadMoreContainer.classList.remove("hidden");
    } else {
      loadMoreContainer.classList.add("hidden");
    }
  }

  // --- MODAL ---
  const selected = getSelectedCountry();

  if (selected && modalContainer) {
    const borderNames = getBorderNames(selected.borders || []);
    modalContainer.innerHTML = renderCountryDetailModal(selected, borderNames);
    modalContainer.classList.remove("hidden");
    modalContainer.classList.add("flex");
    document.body.style.overflow = "hidden";
  } else if (modalContainer) {
    modalContainer.classList.add("hidden");
    modalContainer.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
};

// ========================================================
// 4. SUSCRIPCIÓN REACTIVA
// ========================================================
subscribe(() => {
  renderUI();
  if (favsCounter) {
    favsCounter.textContent = getFavoriteCodes().length.toString();
  }
});

// ========================================================
// 5. EVENTOS
// ========================================================

const optimizedSearch = debounce((text: string) => {
  setSearchQuery(text);
}, 350);

inputSearch?.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  optimizedSearch(target.value);
});

// Load More — se registra una sola vez
document.getElementById("btn-load-more")?.addEventListener("click", () => {
  loadMore();
});

// Delegación de eventos en la grilla
resultsContainer?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  const btnFav = target.closest(".btn-fav");
  if (btnFav) {
    const id = (btnFav as HTMLElement).dataset.id;
    if (id) toggleCountryFavorite(id);
    return;
  }

  const btnEmptyState = target.closest("#btn-empty-state-explore");
  if (btnEmptyState) {
    toggleShowFavorites();
    const btnHeaderFavs = document.getElementById("btn-show-favorites");
    if (btnHeaderFavs) {
      btnHeaderFavs.classList.remove(
        "bg-rose-600",
        "dark:bg-rose-700",
        "text-white",
        "border-rose-600",
        "dark:border-rose-700",
        "is-active",
      );
      btnHeaderFavs.classList.add(
        "bg-rose-50",
        "dark:bg-rose-950/30",
        "text-rose-600",
        "dark:text-rose-400",
        "border-rose-100",
        "dark:border-rose-900/40",
      );
    }
    return;
  }

  const card = target.closest(".country-card");
  if (card) {
    const id = (card as HTMLElement).dataset.id;
    if (id) openCountryModal(id);
  }
});

// Favoritos header
btnShowFavorites?.addEventListener("click", () => {
  toggleShowFavorites();
  const isFilterActive = btnShowFavorites.classList.toggle("is-active");

  if (isFilterActive) {
    btnShowFavorites.classList.remove(
      "bg-rose-50",
      "dark:bg-rose-950/30",
      "text-rose-600",
      "dark:text-rose-400",
      "border-rose-100",
      "dark:border-rose-900/40",
    );
    btnShowFavorites.classList.add(
      "bg-rose-600",
      "dark:bg-rose-700",
      "text-white",
      "dark:text-white",
      "border-rose-600",
      "dark:border-rose-700",
    );
  } else {
    btnShowFavorites.classList.remove(
      "bg-rose-600",
      "dark:bg-rose-700",
      "text-white",
      "dark:text-white",
      "border-rose-600",
      "dark:border-rose-700",
    );
    btnShowFavorites.classList.add(
      "bg-rose-50",
      "dark:bg-rose-950/30",
      "text-rose-600",
      "dark:text-rose-400",
      "border-rose-100",
      "dark:border-rose-900/40",
    );
  }
});

// Sort buttons
const updateSortButtonsUI = (activeBtn: HTMLButtonElement) => {
  [btnSortPop, btnSortName]
    .filter((btn): btn is HTMLButtonElement => Boolean(btn))
    .forEach((btn) => {
      if (btn === activeBtn) {
        btn.classList.add("bg-blue-600", "text-white", "border-blue-600");
        btn.classList.remove(
          "bg-slate-100",
          "dark:bg-slate-800",
          "text-slate-700",
        );
      } else {
        btn.classList.remove("bg-blue-600", "text-white", "border-blue-600");
        btn.classList.add(
          "bg-slate-100",
          "dark:bg-slate-800",
          "text-slate-700",
        );
      }
    });
};

btnTheme?.addEventListener("click", () => {
  const isDark = toggleTheme();
  console.log(`Modo oscuro: ${isDark}`);
});

btnSortPop?.addEventListener("click", () => {
  setSort("population-desc");
  if (btnSortPop) updateSortButtonsUI(btnSortPop);
});

btnSortName?.addEventListener("click", () => {
  setSort("name-asc");
  if (btnSortName) updateSortButtonsUI(btnSortName);
});

selectRegion?.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  setRegionFilter(target.value as Region);
});

// Modal
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

// ========================================================
// 6. ARRANQUE
// ========================================================
const startApp = async (): Promise<void> => {
  const favsCounter = document.querySelector<HTMLSpanElement>(
    "#favs-count-display",
  );
  initSort();
  initTheme();

  const savedFavorites = getFavoriteCodes();
  if (favsCounter) favsCounter.textContent = savedFavorites.length.toString();

  try {
    await loadCountries(savedFavorites);
  } catch (error) {
    console.error("[Main] Error crítico durante el arranque:", error);
  }

  const currentSort = getSort();
  if (currentSort === "population-desc") updateSortButtonsUI(btnSortPop!);
  if (currentSort === "name-asc") updateSortButtonsUI(btnSortName!);
};

startApp();
