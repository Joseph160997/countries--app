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
  getComparisonCodes,
  getIsComparisonActive,
  getComparisonCount,
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
import { renderHero } from "@/presentation/components/hero";
import { renderComparisonView } from "../components/comparisonView";
import {
  buildComparisonRows,
  getComparisonCountries,
} from "../slices/comparison.selectors";
import { renderComparisonBar } from "../components/comparisonBar";

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
  "text-rose-700",
  "dark:text-rose-300",
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
// ESTADO DEL RENDERER (fingerprints para evitar repintados)
// ========================================================
let lastGridFingerprint: string | null = null;
let lastModalCca3: string | null = null;
let heroRendered = false;
let lastFavoritesSet: Set<string> | null = null;
let lastComparisonCca3s: string | null = null;

// ========================================================
// RENDERIZADO — cada función pinta UN aspecto del estado
// ========================================================

// ─── Grid de países ───
const renderGrid = (): void => {
  if (!resultsContainer) return;

  let html: string;
  let fingerprint: string;

  if (getIsLoading()) {
    fingerprint = "loading";
    html = renderSkeletonGrid(20);
    // Reset de tracking de favoritos al cargar
    lastFavoritesSet = null;
  } else {
    const visible = getCountries();
    const comparisonCodes = getComparisonCodes();

    // Fingerprint BASE: qué países están visibles + comparación
    // NOTA: ya NO incluimos isFavorite aquí. Los favoritos se
    // parchean selectivamente abajo, sin re-renderizar el grid.
    fingerprint =
      `${isShowingFavoritesActive() ? "favs" : "all"}:` +
      (visible.map((c) => c.cca3).join("|") || "empty") +
      `:cmp:${comparisonCodes.join(",")}`;

    if (visible.length === 0) {
      const isFavsView = isShowingFavoritesActive();
      html = renderEmptyStateCard(
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
      lastFavoritesSet = null;
    } else {
      html = visible.map((c) => renderCountryCard(c, comparisonCodes)).join("");
    }
  }

  // ─── ¿Cambio el fingerprint base? → re-render completo ───
  if (fingerprint !== lastGridFingerprint) {
    lastGridFingerprint = fingerprint;
    lastFavoritesSet = null; // Forzar sync de favoritos en el próximo paso
    resultsContainer.innerHTML = html;
  }

  // ─── Patch selectivo de favoritos (sin re-render) ───
  if (!getIsLoading()) {
    patchFavoritesOnly();
  }
};

/**
 * Actualiza solo los botones de favorito en el DOM, sin destruir las cards.
 * Esto evita que las banderas se re-animen cuando solo cambia isFavorite.
 *
 * Compara el set actual de favoritos con el último conocido.
 * Solo toca los botones cuyo estado realmente cambió.
 */
const patchFavoritesOnly = (): void => {
  const visible = getCountries();
  const currentFavSet = new Set(
    visible.filter((c) => c.isFavorite).map((c) => c.cca3),
  );

  // Primera ejecución después de un re-render completo → sincronizar todo
  if (lastFavoritesSet === null) {
    lastFavoritesSet = currentFavSet;
    visible.forEach((c) => updateFavoriteButton(c.cca3, c.isFavorite));
    return;
  }

  // Detectar cambios: países que entraron o salieron del set de favoritos
  for (const cca3 of currentFavSet) {
    if (!lastFavoritesSet.has(cca3)) {
      // Nuevo favorito
      updateFavoriteButton(cca3, true);
    }
  }
  for (const cca3 of lastFavoritesSet) {
    if (!currentFavSet.has(cca3)) {
      // Dejó de ser favorito
      updateFavoriteButton(cca3, false);
    }
  }

  lastFavoritesSet = currentFavSet;
};

/**
 * Actualiza un solo botón de favorito en el DOM por su cca3.
 * Busca el botón con querySelector y cambia su innerHTML.
 */
const updateFavoriteButton = (cca3: string, isFavorite: boolean): void => {
  const btn = resultsContainer?.querySelector<HTMLButtonElement>(
    `.btn-fav[data-id="${cca3}"]`,
  );
  if (!btn) return;
  btn.innerHTML = isFavorite ? "❤️" : "🤍";
};

// ─── Paginación ───
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

// ─── Modal de detalle ───
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

// ─── Widgets del header (contador de favoritos, botones de sort) ───
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

// ─── Hero carrusel ───
const renderHeroSection = (): void => {
  const container = document.getElementById("hero-container");
  if (!container || heroRendered) return;

  // NO pintar skeleton: esperar a los datos reales.
  // Esto evita la "destrucción de LCP" que penaliza Lighthouse.
  // Trade-off: el hero aparece un poco más tarde, pero cuando
  // aparece, es la versión definitiva y no se re-carga.
  if (getIsLoading()) return;

  const slides = getHeroSlides();
  if (slides.length === 0) return;

  container.innerHTML = renderHero(slides);
  heroRendered = true;
};

// ─── Barra flotante de comparación ───
let lastBarFingerprint: string | null = null;

const renderComparisonBarSection = (): void => {
  const existingBar = document.getElementById("comparison-bar");
  const count = getComparisonCount();
  const canCompare = count >= 2;

  // Sin países seleccionados → destruir la barra si existe
  if (count === 0) {
    if (existingBar) existingBar.remove();
    lastBarFingerprint = null;
    return;
  }

  // Fingerprint: combina count + canCompare para detectar cambios relevantes
  const fingerprint = `${count}:${canCompare}`;

  // Si el fingerprint no cambió, no hay nada que hacer
  if (fingerprint === lastBarFingerprint && existingBar) {
    return;
  }

  lastBarFingerprint = fingerprint;

  // Fingerprint cambió → re-renderizar la barra completa
  if (existingBar) existingBar.remove();

  const html = renderComparisonBar({
    count,
    maxCount: 3,
    canCompare,
  });

  if (!html) return;

  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const bar = template.content.firstElementChild as HTMLElement;
  if (bar) {
    document.body.appendChild(bar);
  }
};

// ─── Vista de comparación (overlay) ───
const renderComparisonSection = (): void => {
  const existingOverlay = document.getElementById("comparison-overlay");
  const isActive = getIsComparisonActive();

  // Vista cerrada → destruir el overlay si existe
  if (!isActive) {
    if (existingOverlay) {
      existingOverlay.remove();
      lastComparisonCca3s = null;
      document.body.style.overflow = "auto";
    }
    return;
  }

  // Vista abierta → construir datos y renderizar
  const countries = getComparisonCountries();
  const rows = buildComparisonRows(countries);
  const cca3Key = countries.map((c) => c.cca3).join(",");

  // Si ya está abierta con los mismos países, no re-renderizamos
  if (lastComparisonCca3s === cca3Key && existingOverlay) return;

  lastComparisonCca3s = cca3Key;

  if (existingOverlay) existingOverlay.remove();

  const html = renderComparisonView({ countries, rows });
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const overlay = template.content.firstElementChild as HTMLElement;
  if (overlay) {
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }
};

// ─── Orquestador: llama a todas las funciones de renderizado ───
const renderUI = (): void => {
  renderGrid();
  renderPaginationSection();
  renderModal();
  renderHeaderWidgets();
  renderHeroSection();
  renderComparisonBarSection();
  renderComparisonSection();
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
