import {
  toggleComparisonCountry,
  openComparisonView,
  closeComparisonView,
  clearComparison,
  getIsComparisonActive,
} from "@/presentation/state/countryState";

/**
 * Controller del Modo Comparación.
 *
 * Traduce eventos del DOM a acciones del estado de comparación.
 * No manipula el DOM directamente: el renderer se encarga de pintar
 * la barra flotante y la vista de comparación.
 *
 * ESC usa capture phase para interceptar el evento ANTES de que
 * llegue al modal.controller (bubble). Si la comparación está
 * abierta, Esc cierra la comparación y stopPropagation evita
 * que el modal también se cierre.
 */

export const initComparisonController = (): void => {
  // ─── Botón de comparar en cards (event delegation) ───
  // El grid se re-renderiza constantemente. Si pusiera listeners
  // en cada botón, los perderíamos en cada repintado.
  // Event delegation sobre el contenedor padre sobrevive a los repintados.
  document
    .querySelector("#result-container")
    ?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLButtonElement>(".btn-compare");
      if (!btn) return;

      const cca3 = btn.dataset.id;
      if (!cca3) return;

      toggleComparisonCountry(cca3);
    });

  // ─── Barra flotante y vista de comparación ───
  // Delegación sobre el body: la barra y la vista se crean/destruyen
  // dinámicamente por el renderer. No podemos poner listeners directos
  // porque los elementos no existen al momento de init.
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // "Compare" en la barra flotante
    if (target.closest("#btn-open-comparison")) {
      openComparisonView();
      return;
    }

    // "Clear" en la barra flotante
    if (target.closest("#btn-clear-comparison")) {
      clearComparison();
      return;
    }

    // Cerrar la vista de comparación
    if (target.closest("#close-comparison")) {
      closeComparisonView();
      return;
    }

    // Click en el backdrop del overlay de comparación
    if (target.id === "comparison-overlay") {
      closeComparisonView();
      return;
    }
  });

  // ─── Esc: cierra la comparación con prioridad sobre el modal ───
  // Capture phase: se ejecuta ANTES que los handlers en bubble.
  // modal.controller registra su Esc en bubble (fase por defecto).
  // Así, si la comparación está abierta, Esc la cierra y
  // stopPropagation evita que el modal también se cierre.
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && getIsComparisonActive()) {
        e.stopPropagation();
        closeComparisonView();
      }
    },
    { capture: true },
  );
};
