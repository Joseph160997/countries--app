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
let favoriteCodes: string[] = JSON.parse(localStorage.getItem("favs") || "[]"); //Arreglo de los paises favoritos
let isLoading: boolean = false; //Bandera para saber si estamos cargando los paises

// 3. DOM ELEMENTS
//Aqui guardamos los elementos del DOM('HTML)
const resultContainer =
  document.querySelector<HTMLElement>("#result-container");
const inputSearch = document.querySelector<HTMLInputElement>("#input-search");
const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
//boton favoritos
//modal

// 4. Core funtion
//Aqui va la funcion de pintar en el DOM

const render = (paises = countries) => {
  // 1. SEGURIDAD: sino existe el contenedor, no hacemos nada "ASI NO SE ROMPE EL CODIGO"
  if (!resultContainer) return;

  // 2. Limpieza: Antes de pintar limpiamos el contenedor
  resultContainer.innerHTML = "";

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
  resultContainer.innerHTML = htmlCards.join("");
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
    if (resultContainer) {
      resultContainer.innerHTML = `
    <p class="col-span-full text-center text-red-500 font-bold">Error: ${(error as Error).message}</p>`;
    }
  } finally {
    // 8. FINALIZACIÓN: Pase lo que pase, finalizamos el estado de carga
    isLoading = false;
  }
};

//Funcion para la busqueda (con el debounce)
const handleSearch = () => {
  //aqui ira el cronometro (setTimeout)
  //filter()
};

//Funcion para el modal
const openModal = (id: string) => {
  //aqui buscaremos el pais por su id
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

// 5. even listeners
//Aqui escuchamos los eventos del DOM
inputSearch?.addEventListener("input", handleSearch);

//favitoris

//modal

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
