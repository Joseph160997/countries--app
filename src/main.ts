import "./style.css";

// ========================================================
// 1. DATA CONTRACT (INTERFASE)
// ========================================================
// Define la "forma" que deben tener nuestros objetos para que TS nos proteja.
interface Country {
  name: string;
  flag: string;
  population: number;
  region: string;
  capital: string;
  cca3: string; // El ID único de 3 letras (ej: "COL", "ESP")
  isFavorite: boolean;
}

// ========================================================
// 2. GLOBAL STATE (El cerebro de la App)
// ========================================================
// 💡 SECUENCIA MENTAL: Separamos el "Almacén" (todos) de la "Vitrina" (lo que se ve).
let allCountries: Country[] = []; // Almacén original (intocable tras la carga)
let countries: Country[] = []; // Lo que el usuario está viendo actualmente
let favoriteCodes: string[] = JSON.parse(localStorage.getItem("favs") || "[]");
let isLoading: boolean = false; // Estado de carga
let searchTimer: number; // Para el sistema de "Debounce"
let isShowingFavs: boolean = false; // Interruptor de modo favoritos

// ========================================================
// 3. DOM ELEMENTS (Selectores)
// ========================================================
const resultsContainer =
  document.querySelector<HTMLDivElement>("#result-container");
const inputSearch = document.querySelector<HTMLInputElement>("#search-input");
const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
const modalContainer =
  document.querySelector<HTMLDivElement>("#modal-container");
const modalContent = document.querySelector<HTMLDivElement>("#modal-content");
const btnShowFavorites = document.querySelector<HTMLButtonElement>(
  "#btn-show-favorites",
);
const favsCounter = document.querySelector<HTMLSpanElement>(
  "#favs-count-display",
);

// ========================================================
// 4. CORE FUNCTIONS (Lógica de Negocio)
// ========================================================

/**
 * FUNCIÓN: RENDER (La Impresora)
 * Toma un array de países y los dibuja en el HTML.
 * @param paises - Por defecto usa la lista filtrada 'countries'
 */
const render = (paises = countries): void => {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = ""; // Limpiamos la "mesa" de trabajo

  // 🔄 USAMOS MAP: Transformamos objetos JS en Strings de HTML
  const htmlCards = paises.map((country) => {
    return `
    <article data-id="${country.cca3}" class="country-card bg-white dark:bg-slate-800 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 flex flex-col">
      <img src="${country.flag}" alt="flag of ${country.name}" class="w-full h-40 object-cover"/>
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h2 class="font-bold text-xl mb-3 text-slate-900 dark:text-white leading-tight">${country.name}</h2>
          <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><span class="font-bold text-slate-800 dark:text-slate-200">Population:</span> ${country.population.toLocaleString()}</p>
            <p><span class="font-bold text-slate-800 dark:text-slate-200">Code:</span> ${country.cca3}</p>
            <p><span class="font-bold text-slate-800 dark:text-slate-200">Region:</span> ${country.region}</p>
            <p><span class="font-bold text-slate-800 dark:text-slate-200">Capital:</span> ${country.capital}</p>
          </div>
        </div>
        <button data-id="${country.cca3}" class="btn-fav self-start mt-5 text-2xl hover:scale-125 transition-transform">
          ${country.isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
    </article>`;
  });

  resultsContainer.innerHTML = htmlCards.join(""); // Unimos todo el HTML
};

/**
 * FUNCIÓN: FETCH (El Viaje a la API)
 * Obtiene los datos de internet y los "normaliza" a nuestra interfase.
 */
const fetchCountries = async (): Promise<void> => {
  isLoading = true;
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3",
    );
    if (!response.ok) throw new Error("Error en la conexión con la API");

    const data = await response.json();

    // ✨ MAPPING PROFESIONAL: "Limpiamos" los datos que vienen de la API
    allCountries = data.map((p: any) => ({
      name: p.name.common,
      flag: p.flags.svg,
      population: p.population,
      region: p.region,
      capital: p.capital?.[0] || "No Capital",
      cca3: p.cca3,
      isFavorite: favoriteCodes.includes(p.cca3),
    }));

    countries = [...allCountries]; // Llenamos la vitrina por primera vez
    render();
  } catch (error) {
    console.error("Fetch error:", error);
    if (resultsContainer)
      resultsContainer.innerHTML = `<p class="text-red-500">Error: ${(error as Error).message}</p>`;
  } finally {
    isLoading = false;
  }
};

/**
 * FUNCIÓN: SEARCH (Buscador con Debounce)
 * Evita que la app busque cada vez que tocas una tecla, esperando 500ms de calma.
 */
const handleSearch = (e: Event): void => {
  const query = (e.target as HTMLInputElement).value.toLowerCase().trim();

  // ⏱️ DEBOUNCE: Borramos el cronómetro anterior si el usuario sigue escribiendo
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    // Filtrado inteligente: Busca por NOMBRE o por REGIÓN
    countries = allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query),
    );
    render();

    if (countries.length === 0 && resultsContainer) {
      resultsContainer.innerHTML = `<h3 class="col-span-full text-center opacity-50">No results found for "${query}"</h3>`;
    }
  }, 500);
};

/**
 * FUNCIÓN: MODAL (Detalles del País)
 * Abre una ventana con información extra.
 */
const openModal = (code: string): void => {
  const country = allCountries.find((c) => c.cca3 === code);
  if (!country || !modalContainer || !modalContent) return;

  modalContainer.classList.remove("hidden");
  modalContent.innerHTML = `
    <button id="close-modal" class="absolute top-5 right-5 text-2xl cursor-pointer">❌</button>
    <div class="p-8">
      <img src="${country.flag}" class="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg" />
      <h2 class="text-3xl font-black mb-4 dark:text-white">${country.name}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-600 dark:text-slate-400">
        <p><span class="font-bold text-slate-900 dark:text-slate-200">Region:</span> ${country.region}</p>
        <p><span class="font-bold text-slate-900 dark:text-slate-200">Capital:</span> ${country.capital}</p>
        <p><span class="font-bold text-slate-900 dark:text-slate-200">Population:</span> ${country.population.toLocaleString()}</p>
        <p><span class="font-bold text-slate-900 dark:text-slate-200">Official Code:</span> ${country.cca3}</p>
      </div>
    </div>`;

  document.getElementById("close-modal")?.addEventListener("click", () => {
    modalContainer.classList.add("hidden");
  });
};

/**
 * FUNCIÓN: FAVORITOS (Toggle y Persistencia)
 * Agrega o quita países del baúl de favoritos.
 */
const toggleFavorites = (code: string): void => {
  const index = favoriteCodes.indexOf(code);

  // 1. Actualizamos la lista de códigos (El "DNI")
  if (index === -1) {
    favoriteCodes.push(code);
  } else {
    favoriteCodes.splice(index, 1);
  }

  // 2. Persistencia en LocalStorage
  localStorage.setItem("favs", JSON.stringify(favoriteCodes));

  // 3. Sincronización del Estado: Marcamos isFavorite en nuestros arrays
  [allCountries, countries].forEach((list) => {
    list.forEach((c) => {
      if (c.cca3 === code) c.isFavorite = !c.isFavorite;
    });
  });

  updateFavCounter();
  render();
};

/**
 * FUNCIONES DE APOYO (Utilidades)
 */
const updateFavCounter = (): void => {
  if (!favsCounter) return; // Protección ante elementos no encontrados
  favsCounter.textContent = favoriteCodes.length.toString(); // Actualizamos el contador
  favoriteCodes.length === 0
    ? favsCounter.classList.add("hidden") // Si no hay favoritos, ocultamos el contador
    : favsCounter.classList.remove("hidden"); // Si hay favoritos, lo mostramos
};

const toggleTheme = (): void => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

const initTheme = (): void => {
  if (localStorage.getItem("theme") === "dark")
    document.documentElement.classList.add("dark");
};

// ========================================================
// 5. EVENT LISTENERS (Interacciones)
// ========================================================

// Buscador
inputSearch?.addEventListener("input", handleSearch);

// Delegación de eventos en el contenedor de resultados
// Se utiliza el patrón de diseño 'Delegación de Eventos' para
// escuchar los eventos de clic en el contenedor de resultados y
// delegar la lógica de negocio en funcionesas específicas
resultsContainer?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  // Caso 1: Clic en botón de favorito
  // Se busca el botón de favorito en el elemento clickeado
  const btnFav = target.closest(".btn-fav");
  if (btnFav) {
    // Si el clic fue en el botón de favorito (o dentro de él)
    const id = (btnFav as HTMLElement).dataset.id;
    if (id) toggleFavorites(id); // Se llama a la función toggleFavorites con el id del país
    return; // Importante para que no abra el modal también
  }

  // Caso 2: Clic en la tarjeta (Abrir Modal)
  // Se busca la tarjeta del país en el elemento clickeado
  const card = target.closest(".country-card");
  if (card) {
    const id = (card as HTMLElement).dataset.id;
    if (id) openModal(id); // Se llama a la función openModal con el id del país
  }
});

// Filtros y Ordenamiento
// Se agrega un listener de clic al botón de cambio de tema
themeToggle?.addEventListener("click", toggleTheme);
// La función toggleTheme se encarga de cambiar el tema de la app

// Se agrega un listener de clic al botón de ordenar por población
document.querySelector("#sort-pop")?.addEventListener("click", () => {
  countries.sort((a, b) => b.population - a.population); // Se ordena la lista de países por población en orden descendente
  render(); // Se llama a la función render para dibujar la lista de países en el HTML
});

// Se agrega un listener de clic al botón de ordenar por nombre
document.querySelector("#sort-name")?.addEventListener("click", () => {
  countries.sort((a, b) => a.name.localeCompare(b.name)); // Se ordena la lista de países por nombre en orden alfabético
  render(); // Se llama a la función render para dibujar la lista de países en el HTML
});

// Se agrega un listener de cambio al select de regiones
document.querySelector("#filter-region")?.addEventListener("change", (e) => {
  const region = (e.target as HTMLSelectElement).value;
  countries =
    region === "all"
      ? [...allCountries] // Si se selecciona "all", se crea una copia de la lista de países
      : allCountries.filter((c) => c.region === region); // Si se selecciona una región, se filtra la lista de países por esa región
  render(); // Se llama a la función render para dibujar la lista de países en el HTML
});

// Se agrega un listener de clic al botón de mostrar favoritos
btnShowFavorites?.addEventListener("click", () => {
  isShowingFavs = !isShowingFavs; // Se cambia el estado de mostrar favoritos
  countries = isShowingFavs
    ? allCountries.filter((c) => c.isFavorite) // Si se muestra favoritos, se crea una lista con los países favoritos
    : [...allCountries]; // Si no se muestra favoritos, se crea una copia de la lista de países
  btnShowFavorites?.classList.toggle("bg-red-500", isShowingFavs); // Se cambia el estilo del botón para indicar si se muestra favoritos o no
  btnShowFavorites?.classList.toggle("text-white", isShowingFavs);
  render(); // Se llama a la función render para dibujar la lista de países en el HTML
});

// ========================================================
// 6. INITIALIZATION (Arranque)
// ========================================================
initTheme();
updateFavCounter();
fetchCountries();
