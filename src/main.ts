import "./style.css";
import { initializeLayout } from "./components/layout";
import {
  subscribe,
  getCountries,
  loadCountries,
  setSearchQuery,
  setRegionFilter,
} from "./state/countryState";
import { debounce } from "./utils/debouce";
import type { Country } from "./types/Country";
import { renderCountryCard } from "./components/countryCards";
import { showToast } from "./utils/toast";
import { storageService } from "./utils/localStorage";
import { getFavoriteCodes } from "./services/favoriteService";
import { toggleCountryFavorite } from "./state/countryState";

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
const filterRegion =
  document.querySelector<HTMLSelectElement>("#filter-region");
const favsCounter = document.querySelector<HTMLSpanElement>(
  "#favs-count-display",
);

// ========================================================
// 3. CAPA DE RENDERIZADO (La Impresora Pura)
// ========================================================
/**
 * Solicita los paises al gestor de estado y los muestra en pantalla.
 */
const renderUI = (): void => {
  // Verificamos que el contenedor exista antes de intentar renderizar
  if (!resultsContainer) {
    console.error("Contenedor de resultados no encontrado en el DOM.");
    return;
  }

  // 1. Pedimos la copia de los paises filtrados al estado GOBAL.
  const countriesToRender = getCountries(20); // Limite de 20 para evitar saturar la UI

  // 2. Sino hay coincidencias ene l filtro mostramos un mensaje amigable
  if (countriesToRender.length === 0) {
    resultsContainer.innerHTML = `
      <div class="col-span-full text-center py-12 opacity-50 font-medium">
        No countries found matching your criteria.
      </div>
    `;
    return;
  }

  // 3. Generamos el HTML de cada tarjeta y lo inyectamos en el contenedor
  resultsContainer.innerHTML = countriesToRender
    .map((country) => renderCountryCard(country))
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

  // CASO A: Hizo clic en el botón de favoritos
  const btnFav = target.closest(".btn-fav");
  if (btnFav) {
    const id = (btnFav as HTMLElement).dataset.id;
    if (id) toggleCountryFavorite(id); // Llamamos a tu función del estado
    return; // 🛑 IMPORTANTE: Detenemos la ejecución aquí para no abrir el modal
  }

  // CASO B: Hizo clic en la tarjeta (pero no en el botón)
  const card = target.closest(".country-card");
  if (card) {
    const id = (card as HTMLElement).dataset.id;
    if (id) {
      console.log(`Abrir modal para el país: ${id}`);
      // openModal(id); -> Lo activaremos cuando refactoricemos el modal
    }
  }
});

// ========================================================
// 6. ARRANQUE INICIAL (Bootstrapping)
// ========================================================

/**
 * Orquesta la carga de configuración inicial y arranca el flujo de datos.
 */
const startApp = async (): Promise<void> => {
  // 1. Buscamos el selector del contador de favoritos que está en el Header
  const favsCounter = document.querySelector<HTMLSpanElement>(
    "#favs-count-display",
  );

  // 2. Usamos TU nuevo storageService para recuperar los favoritos de forma segura
  // Le indicamos a TypeScript que esperamos un array de strings <string[]>
  const savedFavorites = storageService.get<string[]>("favs") || [];

  // 3. Si el elemento existe en el DOM, actualizamos su número inicial
  if (favsCounter) {
    favsCounter.textContent = savedFavorites.length.toString();
  }

  try {
    // 4. Disparamos la carga inicial del estado pasándole los favoritos del LocalStorage.
    // Esto ejecutará internamente applyFilters() dentro del estado, lo cual llamará
    // a notify() y tu vigilante finalmente imprimirá los países en la pantalla.
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
