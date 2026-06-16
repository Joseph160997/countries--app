import "./style.css";
import { initializeLayout } from "./components/layout";
import {
  subscribe,
  getCountries,
  loadCountries,
  setSearchQuery,
  isShowingFavoritesActive,
} from "./state/countryState";
import { debounce } from "./utils/debounce";
import { renderCountryCard } from "./components/countryCards";
import { getFavoriteCodes } from "./services/favoriteService";
import {
  toggleCountryFavorite,
  toggleShowFavorites,
} from "./state/countryState";
import { renderEmptyStateCard } from "./components/emptyState";
import { toggleTheme, initTheme } from "./services/themeService";

// ========================================================
// 1. INICIALIZACIÓN DE LA INTERFAZ (DOM Dinámico)
// ========================================================
// Inyectamos el Header, Main y Footer antes de buscar cualquier selector
initializeLayout("app");

// ========================================================
// 2. CAPTURA DE ELEMENTOS DEL DOM
// ========================================================
// Ahora que los elementos ya existen en la pantalla, los guardamos en constantes
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

// ========================================================
// 3. CAPA DE RENDERIZADO (La Impresora Pura)
// ========================================================
/**
 * Solicita los paises al gestor de estado y los muestra en pantalla.
 */
const renderUI = (): void => {
  if (!resultsContainer) return;

  const countriesToRender = getCountries();

  if (countriesToRender.length === 0) {
    // 1. Detectamos el contexto del estado global
    // Asumimos que tienes acceso a saber si se están filtrando favoritos
    const isFavsView = isShowingFavoritesActive();

    // 2. Definimos el mensaje según el caso
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
          showButton: false, // No mostramos el botón si es solo una búsqueda fallida
        };

    // 3. Inyectamos con la configuración adecuada
    resultsContainer.innerHTML = renderEmptyStateCard(config);
    return;
  }

  // Renderizado normal de tarjetas...
  resultsContainer.innerHTML = countriesToRender
    .map(renderCountryCard)
    .join("");
};

// ========================================================
// 4. SUSCRIPCIÓN REACTIVA (Patrón Observador)
// ========================================================
// Nos enganchamos al cerebro central. Cada vez que el estado cambie (al buscar o filtrar),
// este callback se ejecutará automáticamente de inmediato, redibujando la pantalla.
const unsubscribe = subscribe(() => {
  // 1. Redibujamos las tarjetas en la pantalla principal
  renderUI();

  // 2. Actualizamos el Header de forma independiente y eficiente
  if (favsCounter) {
    const totalFavorites = getFavoriteCodes().length;
    favsCounter.textContent = totalFavorites.toString();
  }
});

// ========================================================
// 5. ASIGNACIÓN DE EVENTOS CON DEBOUNCE
// ========================================================

/**
 * Creaos una version optimizada de la accion de busqueda.
 * Retrasala ejecución hasta que el usuario deje de escribir por 355ms.
 */
/**
 * Creamos una versión optimizada de la acción de búsqueda.
 * Retrasa la ejecución 350ms para proteger el rendimiento de la app.
 */
const optimizedSearch = debounce((text: string) => {
  setSearchQuery(text);
}, 350);

// Escuchamos el evento de teclado en el input de búsqueda
inputSearch?.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  // Invocamos nuestra función con debounce en lugar de cambiar el estado directamente
  optimizedSearch(target.value);
});

// ========================================================
// 5. ASIGNACIÓN DE EVENTOS (Delegación)
// ========================================================

/**
 * Escuchamos el evento de teclado en el input de búsqueda
 */
resultsContainer?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  // =========================================================
  // CASO A: Hizo clic en el botón de favoritos de una tarjeta
  // =========================================================
  const btnFav = target.closest(".btn-fav");
  if (btnFav) {
    const id = (btnFav as HTMLElement).dataset.id;
    if (id) toggleCountryFavorite(id); // Llamamos a tu función del estado
    return; // 🛑 IMPORTANTE: Detenemos la ejecución aquí
  }

  // =========================================================
  // CASO B: Hizo clic en el botón del Empty State (Go Back)
  // =========================================================
  const btnEmptyState = target.closest("#btn-empty-state-explore");
  if (btnEmptyState) {
    // 1. Apagamos el filtro en el estado global
    toggleShowFavorites();

    // 2. Sincronizamos el UI del botón del Header
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

    // 3. Volvemos a pintar toda la interfaz
    renderUI();
    return; // 🛑 Detenemos la ejecución aquí
  }

  // =========================================================
  // CASO C: Hizo clic en cualquier otra parte de la tarjeta
  // =========================================================
  const card = target.closest(".country-card");
  if (card) {
    const id = (card as HTMLElement).dataset.id;
    if (id) {
      console.log(`Abrir modal para el país: ${id}`);
      // openModal(id); -> Lo activaremos cuando refactoricemos el modal
    }
  }
});

/**
 * Evento para el botón del Header "❤️ Favs"
 */
btnShowFavorites?.addEventListener("click", () => {
  // 1. Cambiamos la lógica matemática del estado global
  toggleShowFavorites();

  // 2. Recuperamos el estado actual para saber si quedó activado o desactivado
  // Supongamos que tienes una función en tu estado que te dice si el filtro está activo (ej. IsFilterActive())
  // O si la función toggleShowFavorites() te devuelve el nuevo estado booleano.
  // Si no te lo devuelve, podemos verificar si el botón ya tiene una clase o usar una variable.
  const isFilterActive = btnShowFavorites.classList.toggle("is-active");

  // 3. Modificación quirúrgica de clases basada en el estado real
  if (isFilterActive) {
    // === ESTADO ACTIVO: El usuario está viendo solo sus favoritos ===
    // Removemos los colores suaves del estado inactivo
    btnShowFavorites.classList.remove(
      "bg-rose-50",
      "dark:bg-rose-950/30",
      "text-rose-600",
      "dark:text-rose-400",
      "border-rose-100",
      "dark:border-rose-900/40",
    );

    // Añadimos los colores sólidos del estado activo (Fondo rosa, texto blanco)
    btnShowFavorites.classList.add(
      "bg-rose-600",
      "dark:bg-rose-700",
      "text-white",
      "dark:text-white",
      "border-rose-600",
      "dark:border-rose-700",
    );
  } else {
    // === ESTADO INACTIVO: El usuario volvió a ver todos los países ===
    // Removemos los colores sólidos
    btnShowFavorites.classList.remove(
      "bg-rose-600",
      "dark:bg-rose-700",
      "text-white",
      "dark:text-white",
      "border-rose-600",
      "dark:border-rose-700",
    );

    // Restauramos los colores suaves originales
    btnShowFavorites.classList.add(
      "bg-rose-50",
      "dark:bg-rose-950/30",
      "text-rose-600",
      "dark:text-rose-400",
      "border-rose-100",
      "dark:border-rose-900/40",
    );
  }

  // 4. Forzamos el re-renderizado de la UI para aplicar el filtro en la pantalla
  // Llama aquí a tu función encargada de pintar los países (ej. ApplyFilters() o renderUI())
  renderUI();
});

/**
 * Evento Para El Theme Toggle
 */
btnTheme?.addEventListener("click", () => {
  // Ejecutamos la lógica que creamos en el paso anterior
  const isDark = toggleTheme();

  // Opcional: Aquí podrías cambiar el icono del botón (sol/luna)
  console.log(`Modo oscuro: ${isDark}`);
});
// ========================================================
// 6. ARRANQUE INICIAL (Bootstrapping)
// ========================================================

/**
 * Orquesta la carga de configuración inicial y arranca el flujo de datos.
 */

const startApp = async (): Promise<void> => {
  const favsCounter = document.querySelector<HTMLSpanElement>(
    "#favs-count-display",
  );

  initTheme();

  // 1. ELIMINAMOS el uso directo de storageService.
  // 2. Usamos la ÚNICA FUENTE DE VERDAD de nuestro servicio.
  const savedFavorites = getFavoriteCodes();

  if (favsCounter) {
    favsCounter.textContent = savedFavorites.length.toString();
  }

  try {
    // 3. Pasamos la lista real y unificada a la carga del estado
    await loadCountries(savedFavorites);
  } catch (error) {
    console.error(
      "[Main] Error crítico durante el arranque de la aplicación:",
      error,
    );
  }
};

// ¡Encendemos el motor de la aplicación!
startApp();
