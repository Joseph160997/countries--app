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

// ========================================================
// 1. INICIALIZACIÓN DE LA INTERFAZ (DOM Dinámico)
// ========================================================
// Primero inyectamos el Layout; a partir de este punto los elementos existen en el DOM
initializeLayout("app");

// ========================================================
// 2. CAPTURA DE ELEMENTOS DEL DOM
// ========================================================
const resultsContainer =
  document.querySelector<HTMLDivElement>("#result-container");
const inputSearch = document.querySelector<HTMLInputElement>("#search-input");
const filterRegion =
  document.querySelector<HTMLSelectElement>("#filter-region");
const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
const favsCounter = document.querySelector<HTMLSpanElement>(
  "#favs-count-display",
);

// ========================================================
// 3. CAPA DE RENDERIZADO (La Impresora Pura)
// ========================================================
/**
 * Toma los países del estado y los dibuja en el grid de resultados.
 */
const renderUI = (): void => {
  if (!resultsContainer) return;

  const countriesToRender = getCountries(16); // Limitar a 16 para evitar saturar la UI en esta etapa

  if (countriesToRender.length === 0) {
    resultsContainer.innerHTML = `
      <div class="col-span-full text-center py-12 opacity-50 font-medium">
        No countries match your search or filter criteria.
      </div>
    `;
    return;
  }

  // Transformamos el array de datos en strings HTML limpios
  resultsContainer.innerHTML = countriesToRender
    .map(
      (country) => `
    <article data-id="${country.cca3}" class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">
      <div class="overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 relative">
        <img src="${country.flag}" alt="Flag of ${country.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
      </div>
      <div class="p-5 grow flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            ${country.name}
          </h3>
          <div class="space-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <p><span class="text-slate-400 dark:text-slate-500 font-normal">Population:</span> ${country.population.toLocaleString()}</p>
            <p><span class="text-slate-400 dark:text-slate-500 font-normal">Region:</span> ${country.region}</p>
            <p><span class="text-slate-400 dark:text-slate-500 font-normal">Capital:</span> ${country.capital}</p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md font-bold tracking-wider">${country.cca3}</span>
          <button data-id="${country.cca3}" class="btn-fav text-xl hover:scale-125 transition-transform cursor-pointer p-1">
            ${country.isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </article>
  `,
    )
    .join("");
};

// ========================================================
// 4. SUSCRIPCIÓN REACTIVA (Patrón Observador)
// ========================================================
// Nos suscribimos al estado global. Cada vez que el estado filtre o cargue datos,
// se ejecutará automáticamente renderUI, manteniendo la pantalla al día.
const unsubscribe = subscribe(() => {
  renderUI();
  // Aquí también actualizaremos el contador de favoritos en la UI más adelante
});

// ========================================================
// 5. ASIGNACIÓN DE EVENTOS CON DEBOUNCE
// ========================================================

// Aplicamos tu debounce de 350ms a la acción del buscador
const optimizedSearch = debounce((text: string) => {
  setSearchQuery(text);
}, 350);

inputSearch?.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  optimizedSearch(target.value);
});

// Escuchamos el cambio de región de forma directa (no requiere debounce porque es un select discreto)
filterRegion?.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  setRegionFilter(target.value);
});

// ========================================================
// 6. ARRANQUE INICIAL (Bootstrapping)
// ========================================================
const startApp = async () => {
  // Simulamos o cargamos los códigos de favoritos que tengamos en LocalStorage
  const savedFavorites: string[] = JSON.parse(
    localStorage.getItem("favs") || "[]",
  );

  if (favsCounter) {
    favsCounter.textContent = savedFavorites.length.toString();
  }

  // Disparamos la carga inicial del estado.
  // Esto llamará al servicio (Network-First), guardará en IndexedDB y notificará a la UI.
  await loadCountries(savedFavorites);
};

startApp();
