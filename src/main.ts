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
  renderUI();
});
