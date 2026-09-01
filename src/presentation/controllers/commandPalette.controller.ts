import { searchForPalette } from "@/presentation/slices/palette.selectors";
import { openCountryModal } from "@/presentation/state/countryState";
import { getIsLoading } from "@/presentation/state/countryState";
import { getAllCountries } from "@/presentation/state/countryState";
import {
  renderCommandPalette,
  renderPaletteItem,
} from "@/presentation/components/commandPalette";

/**
 * Controller del Command Palette.
 *
 * ARQUITECTURA:
 * Este controller es AUTOCONTENIDO. No usa slices globales ni el renderer.
 * El estado del palette (abierto/cerrado, query, índice, resultados) vive
 * como variables locales en el closure de initCommandPaletteController().
 *
 * ¿Por qué? Porque el palette es efímero:
 * - Se abre con Ctrl+K, se usa, se cierra con Esc.
 * - Su estado no necesita persistir ni ser compartido.
 * - Cada tecla cambia el estado → re-render del palette SOLO.
 *   Si usáramos el renderer global, cada tecla repintaría el grid entero.
 *
 * FLUJO DE DATOS:
 * Tecla → controller actualiza estado local → re-render del palette
 * Enter/click → controller llama openCountryModal() → estado global → renderer
 *
 * El palette es un CONSUMIDOR del estado global (lee países para buscar),
 * pero no es un PRODUCTOR (no muta slices). La única mutación que dispara
 * es openCountryModal(), que ya existe.
 */

// ─── Estado local del palette (vive en el closure) ───
let isOpen = false;
let query = "";
let selectedIndex = 0;
let results: ReturnType<typeof searchForPalette> = [];
let overlayElement: HTMLElement | null = null;

/**
 * Inicializa el controller. Se llama UNA vez desde main.ts.
 * Registra el listener global de teclado y retorna.
 * No crea DOM hasta que el usuario presiona Ctrl+K.
 */
export const initCommandPaletteController = (): void => {
  document.addEventListener("keydown", handleGlobalKeydown);
};

// ─── Handler global de teclado ───

const handleGlobalKeydown = (event: KeyboardEvent): void => {
  const isModifier = event.metaKey || event.ctrlKey;
  const isK = event.key.toLowerCase() === "k";

  // Ctrl+K / Cmd+K → toggle
  if (isModifier && isK) {
    event.preventDefault(); // Evita el comportamiento default del navegador
    event.stopPropagation(); // Evita que otros handlers lo capturen
    togglePalette();
    return;
  }

  // Si el palette no está abierto, no manejamos ninguna otra tecla
  if (!isOpen) return;

  switch (event.key) {
    case "Escape":
      event.preventDefault();
      event.stopPropagation();
      closePalette();
      break;

    case "ArrowDown":
      event.preventDefault();
      moveSelection(1);
      break;

    case "ArrowUp":
      event.preventDefault();
      moveSelection(-1);
      break;

    case "Enter":
      event.preventDefault();
      selectCurrent();
      break;

    // Cualquier otra tecla → el input la maneja nativamente.
    // No necesitamos interceptarla; el evento 'input' del <input>
    // se encarga de actualizar la búsqueda.
  }
};

// ─── Acciones del palette ───

const togglePalette = (): void => {
  if (isOpen) {
    closePalette();
  } else {
    openPalette();
  }
};

const openPalette = (): void => {
  isOpen = true;
  query = "";
  selectedIndex = 0;
  results = [];

  renderPalette();

  // Focus en el input después de que el DOM esté listo
  requestAnimationFrame(() => {
    const input = document.getElementById(
      "palette-input",
    ) as HTMLInputElement | null;
    input?.focus();
  });
};

const closePalette = (): void => {
  isOpen = false;
  query = "";
  selectedIndex = 0;
  results = [];

  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
};

const moveSelection = (direction: 1 | -1): void => {
  if (results.length === 0) return;

  // Wrapping: si estás en el último y presionas ↓, vas al primero
  selectedIndex = (selectedIndex + direction + results.length) % results.length;
  updateResultsList();
  scrollToSelected();
};

const selectCurrent = (): void => {
  if (results.length === 0) return;

  const country = results[selectedIndex];
  if (!country) return;

  closePalette();
  openCountryModal(country.cca3);
};

// ─── Búsqueda ───

const handleSearchInput = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  query = input.value;
  selectedIndex = 0; // Resetear selección al cambiar la query

  const catalog = getAllCountries();
  const loading = getIsLoading();

  if (loading) {
    results = [];
    updateResultsList();
    return;
  }

  results = searchForPalette(query, catalog);
  updateResultsList();
};

// ─── Renderizado ───

/**
 * Render completo del overlay. Se llama solo al abrir.
 * Las actualizaciones posteriores usan updateResultsList().
 */
const renderPalette = (): void => {
  const loading = getIsLoading();

  const html = renderCommandPalette({
    query,
    results,
    selectedIndex,
    isLoading: loading,
  });

  // Crear un contenedor temporal para parsear el HTML
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  overlayElement = template.content.firstElementChild as HTMLElement;

  if (!overlayElement) return;

  document.body.appendChild(overlayElement);

  // Delegación de eventos en el overlay
  overlayElement.addEventListener("click", handleOverlayClick);

  // Listener del input para búsqueda en tiempo real
  const input = overlayElement.querySelector("#palette-input");
  input?.addEventListener("input", handleSearchInput);
};

/**
 * Actualización parcial: solo la lista de resultados.
 * No re-renderizamos el overlay completo (input, footer, etc.)
 * porque eso perdería el foco del input y el cursor.
 *
 * ¿Por qué innerHTML y no manipulación nodo por nodo?
 * Porque la lista es pequeña (≤8 items) y reemplazarla entera
 * es más simple y rápido que hacer diffing manual.
 */
const updateResultsList = (): void => {
  const listElement = overlayElement?.querySelector("#palette-results");
  if (!listElement) return;

  const loading = getIsLoading();

  if (loading) {
    listElement.innerHTML = `<div class="px-4 py-8 text-center text-sm text-ink-faint dark:text-starlight-faint">Loading countries…</div>`;
    return;
  }

  if (results.length === 0 && query.length > 0) {
    listElement.innerHTML = `<div class="px-4 py-8 text-center text-sm text-ink-faint dark:text-starlight-faint">No countries found</div>`;
    return;
  }

  listElement.innerHTML = results
    .map((country, index) =>
      renderPaletteItem(country, index === selectedIndex),
    )
    .join("");
};

/**
 * Scroll automático para que el item seleccionado siempre sea visible.
 * Sin esto, si navegas con flechas más allá de los 8 visibles,
 * el item seleccionado queda oculto bajo el overflow.
 */
const scrollToSelected = (): void => {
  const listElement = overlayElement?.querySelector("#palette-results");
  const selectedItem = listElement?.querySelector('[aria-selected="true"]');
  selectedItem?.scrollIntoView({ block: "nearest" });
};

// ─── Event delegation para clicks ───

const handleOverlayClick = (event: MouseEvent): void => {
  const target = event.target as HTMLElement;

  // Click en el backdrop (fuera del panel) → cerrar
  if (target.id === "command-palette-overlay") {
    closePalette();
    return;
  }

  // Click en un item de resultado → seleccionar
  const item = target.closest<HTMLElement>(".palette-item");
  if (item) {
    const cca3 = item.dataset.cca3;
    if (cca3) {
      closePalette();
      openCountryModal(cca3);
    }
  }
};
