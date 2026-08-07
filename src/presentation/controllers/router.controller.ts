import { parseHash, toCountryHash } from "@/presentation/routing/hashRoute";
import {
  closeCountryModal,
  getAllCountriesCount,
  getSelectedCountry,
  openCountryModal,
  subscribe,
} from "@/presentation/state/countryState";

/**
 * Router de hash para deep linking del modal.
 *
 * Estrategia MVP:
 * - El estado del modal sigue siendo la fuente de verdad.
 * - El router sincroniza la URL con `history.replaceState`.
 * - Los deep links que llegan antes de la carga se dejan pendientes.
 * - Los CCA3 inválidos se limpian cuando el catálogo ya está disponible.
 *
 * Trade-off consciente:
 * `replaceState` evita ensuciar el historial y evita loops de hashchange.
 * Más adelante podríamos mejorarlo para que el botón "back" cierre el modal
 * de forma más explícita.
 */

let initialized = false;
let pendingCca3: string | null = null;

const getCurrentHash = (): string => window.location.hash;

const replaceHash = (hash: string): void => {
  const target =
    hash === "" ? window.location.pathname + window.location.search : hash;

  try {
    window.history.replaceState(null, "", target);
  } catch {
    // Entornos restringidos pueden bloquear history manipulation.
    // No es crítico: la app sigue funcionando sin URL sync.
  }
};

const tryOpenCountry = (cca3: string): boolean => {
  if (getSelectedCountry()?.cca3 === cca3) return true;

  openCountryModal(cca3);
  return getSelectedCountry()?.cca3 === cca3;
};

const syncHashWithModal = (): void => {
  // No tocar la URL mientras hay un deep link pendiente de resolverse.
  if (pendingCca3 !== null) return;

  const selected = getSelectedCountry();
  const desired = selected ? toCountryHash(selected.cca3) : "";

  if (getCurrentHash() === desired) return;

  replaceHash(desired);
};

const handleHashChange = (): void => {
  const route = parseHash(getCurrentHash());

  // Ruta vacía o desconocida: cierra el modal si hay uno abierto.
  if (!route) {
    pendingCca3 = null;
    if (getSelectedCountry()) closeCountryModal();
    return;
  }

  const opened = tryOpenCountry(route.cca3);

  if (opened) {
    pendingCca3 = null;
    return;
  }

  // Todavía no abrió: puede ser que el catálogo aún esté cargando
  // o que el CCA3 sea inválido.
  pendingCca3 = route.cca3;

  if (getAllCountriesCount() > 0) {
    // Si ya hay países cargados y no abrió, el CCA3 no existe.
    pendingCca3 = null;
    replaceHash("");

    // Si había un modal previo abierto, restaura su hash válido.
    syncHashWithModal();
  }
};

export const initRouter = (): void => {
  if (initialized) return;
  initialized = true;

  window.addEventListener("hashchange", handleHashChange);
  subscribe(syncHashWithModal);

  // Deep link inicial.
  handleHashChange();
};

export const consumePendingHash = (): void => {
  if (pendingCca3 === null) return;
  handleHashChange();
};
