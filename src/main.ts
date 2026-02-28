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

const render = (data = countries) => {
  //aqui ira el .map()que genera las ytarjetas en pantalla

  //aqui ira la logica de no se encontro ningun pais

  console.log("renderizando...", data);
};

//Funcion de pedir los datos a la Api
const fetchCountries = async () => {
  //aqui va la logica de peticion a la Api try catch url

  render();
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

// 5. even listeners
//Aqui escuchamos los eventos del DOM
inputSearch?.addEventListener("input", handleSearch);

//favitoris

//modal

//theme toggle(dark/light "toggle-theme")
themeToggle?.addEventListener("click", toggleTheme);

//6. init
fetchCountries();

// inicializamos theme-toggle
initTheme();
