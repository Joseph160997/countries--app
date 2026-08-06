import { getCurrentPage, setPage } from "@/presentation/state/countryState";

/**
 * Controlador de Paginación.
 * Delegación sobre el contenedor (sobrevive a los repintados del renderer).
 */
export const initPaginationController = (): void => {
  document
    .querySelector("#pagination-container")
    ?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLButtonElement>("[data-page]");
      if (!btn || btn.disabled) return;

      const page = Number(btn.dataset.page);
      if (Number.isNaN(page)) return;

      const before = getCurrentPage();
      setPage(page);

      // Solo scrollea si la página realmente cambió
      if (getCurrentPage() !== before) {
        document
          .querySelector("#result-container")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
};
