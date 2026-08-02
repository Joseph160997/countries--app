import { loadMore } from "@/presentation/state/countryState";

/**
 * Controlador de Paginación
 * Inicializa el botón de "Cargar más" para manejar clicks y cargar más resultados.
 * @returns void
 */
export const initPaginationController = (): void => {
  document
    .querySelector<HTMLButtonElement>("#btn-load-more")
    ?.addEventListener("click", () => {
      loadMore();
    });
};
