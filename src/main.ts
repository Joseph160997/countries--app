import "./style.css";

// 1. DATA CONTRACT (INTERFASE)
//AQUI DEFINIMOS EL TIPO DE DATOS QUE VAMOS A USAR, LA FORMA DE NUESTRO OBJETO
interface Country {
  name: string;
  flag: string;
  population: number;
  region: string;
  capital: string;
  cca3: string;
  isFavorite: boolean;
}

// 2. GLOBAL STATE
//Aqui guardamos la verda de la aplicacion en todo momento
let allCountries: Country[] = []; //Arreglo de todos los paises
let countries: Country[] = []; //Arreglo de los paises que se muestran en pantalla
let favoriteCodes: string[] = JSON.parse(localStorage.getItem("favs") || "[]"); //Arreglo de los paises favoritos json.parse es para convertir el string en un arreglo
let isLoading: boolean = false; //Bandera para saber si estamos cargando los paises
let searchTimer: number; //El cronometro de la busqueda

// 3. DOM ELEMENTS
//Aqui guardamos los elementos del DOM('HTML)
const resultsContainer =
  document.querySelector<HTMLElement>("#result-container");
const inputSearch = document.querySelector<HTMLInputElement>("#search-input");
const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
const modalContainer =
  document.querySelector<HTMLDivElement>("#modal-container");
//const modalClose = document.querySelector<HTMLButtonElement>("#modal-close");
const modalContent = document.querySelector<HTMLDivElement>("#modal-content");

// 4. Core funtion
//Aqui va la funcion de pintar en el DOM

const render = (paises = countries) => {
  // 1. SEGURIDAD: sino existe el contenedor, no hacemos nada "ASI NO SE ROMPE EL CODIGO"
  if (!resultsContainer) return;

  // 2. Limpieza: Antes de pintar limpiamos el contenedor
  resultsContainer.innerHTML = "";

  // 3. EL BUCLE (MAP): Vamos a transformar el array de objetos en un String de (HTML)
  // 3.1 EL METODO MAP: Recorre el arreglo y devuelve un nuevo arreglo con los elementos transformados
  const htmlCards = paises.map((country) => {
    return `
    <article data-id="${country.cca3}" class="country-card bg-white dark:bg-slate-800 runded-3xl shadow-md overflow-hidden hover:shadow-2l hover:-traslate-y-2 transition-all suration-300 cursor-pointer border border-slate-100 dark:border-slate-700 flex flex-col">
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
    <button data-id="${country.cca3}" class="btn-fav self-start mt-5 text-2xl hover:scale-125 transition-transform"> ${country.isFavorite ? "❤️" : "🤍"}</button>
    </article>
    `;
  });

  // 4. INYECCIÓN: Pegamos todas las cards en el contenedor del HTML
  //4.1 EL METODO JOIN: Convierte un array en un String
  resultsContainer.innerHTML = htmlCards.join("");
};

//Funcion de pedir los datos a la Api
const fetchCountries = async () => {
  // 1. INICIALIZACIÓN: Inicianmos el estado de carga.. y limpiamos errores.
  isLoading = true;
  console.log("Cargando paises...");

  try {
    // 2. PETICIÓN: Hcaemos la peticion a la Api (request)
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3,borders",
    );

    // 3. VERIFICACIÓN: Si la respuesta no es ok, lanzamos un error.
    if (!response.ok) {
      throw new Error("No pudimos conectar con el servidor de paises");
    }

    // 4. CONVERSIÓN: Convertimos la respuesta en un JSON
    const data = await response.json();

    // 5. TRANSFORMACIÓN: (MAPING), Los datos de la API viene n un poco "sucios", los loimpiamos para que encajen en nuestra INTERFASE.
    allCountries = data.map((p: any) => ({
      name: p.name.common,
      flag: p.flags.svg,
      population: p.population,
      region: p.region,
      capital: p.capital?.[0] || "No Capital",
      cca3: p.cca3,
      isFavorite: favoriteCodes.includes(p.cca3),
    }));

    // 6. ACTUALIZACIÓN: Actualizamos el estado de la aplicacion con los paises
    countries = [...allCountries];
    render();
  } catch (error) {
    // 7. MANEJO DE ERRORES: Mostramos un mensaje de error en la consola
    console.error("Error detectado:", error);
    if (resultsContainer) {
      resultsContainer.innerHTML = `
    <p class="col-span-full text-center text-red-500 font-bold">Error: ${(error as Error).message}</p>`;
    }
  } finally {
    // 8. FINALIZACIÓN: Pase lo que pase, finalizamos el estado de carga
    isLoading = false;
  }
};

//Funcion para la busqueda (con el debounce)
const handleSearch = (e: Event) => {
  const query = (e.target as HTMLInputElement).value.toLocaleLowerCase().trim();

  // 1.DEBOUNCE: Si el usuario escribe rapido, borramos el cronometro anterio
  clearTimeout(searchTimer);

  // 2. Iniciamos un nuevo cronometro
  searchTimer = setTimeout(() => {
    console.log("Buscando", query);

    // 3. FILTRADO: Buscanmos en allcountries ("Nuestra base de datos limpia")
    countries = allCountries.filter(
      (country) =>
        country.name.toLocaleLowerCase().includes(query) ||
        country.region.toLowerCase().includes(query),
    );

    // 4. ACTUALIZACIÓN: Actualizamos la interfaz
    render();

    // 5. FEEDBACK: Si no hay nada avisamos al usuario
    if (countries.length === 0 && resultsContainer) {
      resultsContainer.innerHTML = `
    <div class="col-span-full text-center py-2">
    <p class="text-4-xl mb-4 >🎍</p>
    <h3 class="text-xl font-bold opacity-50">No countries found for "${query}"</h3>
    </div>
    `;
    }
  }, 500);
};

//Funcion para el modal
const openModal = (code: string) => {
  const country = allCountries.find((c) => c.cca3 === code);
  // si no lo encontramos, no hacemos nada
  if (!country || !modalContainer || !modalContent) return;

  // 1. Mostramos el modal quitando la clase hidden
  modalContainer.classList.remove("hidden");

  // 2. Limpiamos el contenido del modal
  modalContent.innerHTML = `
<button id="close-modal" class="absolute top-5 text-2xl hover:rotate-90 transition-transform cursor-pointer">❌</button>
<div class="p-8">
  <img src="${country.flag}" class="w-full h-64 objetc-cover rounded-2xl mb-6 shadow-lg" />
  <h2 class="text-3xl font-black mb-4 dark:text-white">${country.name}</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-600 dark:text-slate-400">
    <p><span class="font-bold text-slate-900 dark:text-slate-200">Region:</span> ${country.region}</p>
    <p><span class="font-bold text-slate-900 dark:text-slate-200">Capital:</span> ${country.capital}</p>
    <p><span class="font-bold text-slate-900 dark:text-slate-200">Population:</span> ${country.population.toLocaleString()}</p>
    <p><span class="font-bold text-slate-900 dark:text-slate-200">Official Code:</span> ${country.cca3}</p>
  </div>
</div>
`;

  // 3. Agregamos el evento para cerrar el modal
  document.getElementById("close-modal")?.addEventListener("click", () => {
    modalContainer.classList.add("hidden");
  });
};

//FUNCIÓN PAR CAMBIAR EL TEMA (DARK/LIGHT "theme-toggle")
const initTheme = () => {
  //1 revisamos si el usuario ya tiene una preferncia guardada
  const savedTheme = localStorage.getItem("theme");

  //2 si gauardo 'dark' en el localStorage, lo agregamos al HTML
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
};

const toggleTheme = () => {
  //.toggle() se usa para agregar o quitar una clase
  const isDark = document.documentElement.classList.toggle("dark");

  //guarda la preferencia del usuario
  localStorage.setItem("theme", isDark ? "dark" : "light");

  console.log("Interruptor presionado. Modo:", isDark ? "dark" : "light");
};

// FUNCIÓN PARA ORDENAR POR POBLACIÓN ("sort-population") (Desendente-de mayor a menor)
const sortByPopulation = () => {
  //crea una copia de los paises, para no modificar el arreglo original
  countries = [...countries].sort((a, b) => b.population - a.population);
  render(); //volvemos a pintar
};

// FUNCIÍON PARA ORDENAR ALFABETICAMENTE (SORT-NAME) (A-Z)
const sortByName = () => {
  //creamos una copia de los paises para no modificar el arreglo original
  countries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  render();
};

// FUNCIÓN PARA FILTRAR POR REGION (FILTER-BY-REGION)
const filterByRegion = (region: string) => {
  //
  if (region === "all") {
    countries = [...allCountries]; //si se selecciona "all", volvemos a pintar todos los paises
  } else {
    countries = allCountries.filter((c) => c.region === region); //si se selecciona una region, filtramos los paises por region
  }

  render();
};

//Funcion para el boton de favoritos
const toggleFavorites = (code: string) => {
  // 1. Buscamos el pais por su cca3
  const index = favoriteCodes.indexOf(code); // indexof devuelve -1 si no lo encuentra

  // 2. si no lo encontramos, (index -1), lo agregamos
  if (index === -1) {
    favoriteCodes.push(code);
    console.log("❤️ agregado: ${code}");

    // 3. si lo encontramos, lo quitamos
  } else {
    favoriteCodes.splice(index, 1); // splice es para quitar un elemento del arreglo
    console.log("❤️ Quitado: ${code}");
  }

  // 4. PERSISTENCIA: Guardamos los favoritos en el baul del navegador (localstorage)
  localStorage.setItem("favs", JSON.stringify(favoriteCodes));

  // 5. ACTUALIZACIÓN DE DATOS: Recoremostodos los paises y le cambiamos el switch isFavorite
  allCountries = allCountries.map((country) => {
    if (country.cca3 === code) {
      return { ...country, isFavorite: !country.isFavorite }; //creamos una copia del pais y le cambiamos el switch isFavorite
    }
    return country; //si no lo encontramos, lo devolvemos tal cual
  });

  // 6. SINCRONIZACIÓN DE VISTA: Hacemos lo misnmo con la lista que se esta mostrando actualmente, por si hay filtros
  countries = countries.map((c) => {
    if (c.cca3 === code) return { ...c, isFavorite: !c.isFavorite }; //creamos una copia del pais y le cambiamos el switch isFavorite
    return c;
  });

  // 5. PINTAR: Actualizamos la interfaz para que se vean los cambios
  render();
};

// 5. even listeners
//Aqui escuchamos los eventos del DOM
inputSearch?.addEventListener("input", handleSearch);

//favitoris
resultsContainer?.addEventListener("click", (e) => {
  // .closest() busca hacia arriba si hicimos click en un boton de favoritos
  const btn = (e.target as HTMLElement).closest(".btn-fav"); //
  if (btn) {
    // obtenemos el id que guardamos en el atributo data-id
    const id = btn.getAttribute("data-id");
    if (id) toggleFavorites(id);
  }

  //modal
  const target = e.target as HTMLElement; //obtenemos el elemento que hicimos click
  // 1. Si cliclamos en el botono de favoritos, ya lo manejamos antes con stoPropagation()
  if (target.closest(".btn-fav")) return;

  // 2. si clicamos en cualquier otra parte de la tarjeta
  const card = target.closest(".country-card");
  if (card) {
    const countryCode = card.getAttribute("data-id");
    if (countryCode) {
      openModal(countryCode);
    }
  }
});

//theme toggle(dark/light "toggle-theme")
themeToggle?.addEventListener("click", toggleTheme);

// EVENTO PARA EL BOTÓN DE ORDENAR POR POBLACIÓN ("sort-population")
document
  .querySelector("#sort-pop")
  ?.addEventListener("click", sortByPopulation);

// EVENTO PARA EL BOTÓN DE ORDENAR ALFABETICAMENTE ("sort-name")
document.querySelector("#sort-name")?.addEventListener("click", sortByName);

// EVENTO PARA EL BOTÓN DE FILTRAR POR REGION ("filter-by-region")
document.querySelector("#filter-region")?.addEventListener("change", (e) => {
  const select = e.target as HTMLSelectElement;
  filterByRegion(select.value);
});

//6. init
fetchCountries();

// inicializamos theme-toggle
initTheme();
