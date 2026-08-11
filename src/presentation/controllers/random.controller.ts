import { openRandomCountry } from "@/presentation/state/countryState";

/**
 * Controlador del botón de país aleatorio.
 *
 * Es intencionalmente mínimo: el controller NO contiene lógica.
 * Solo traduce el evento DOM (click) a una acción de estado.
 *
 * Si mañana añadimos un atajo de teclado (ej: tecla "R"),
 * lo agregamos aquí sin tocar el estado ni el renderer.
 */
export const initRandomController = (): void => {
  document
    .querySelector<HTMLButtonElement>("#btn-random-country")
    ?.addEventListener("click", openRandomCountry);
};
