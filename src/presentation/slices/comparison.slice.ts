import { createStore, type Store } from "../state/store";

/**
 * Estado del Modo Comparación.
 *
 * selectedCodes: CCA3 de los países elegidos (máx 3).
 *   - Guardamos códigos, no objetos Country. Los datos frescos
 *     se derivan del catálogo en el selector, evitando copias
 *     stale si el usuario cambia favoritos mientras compara.
 *
 * isActive: si la vista comparativa está abierta.
 *   - Independiente de selectedCodes: el usuario puede tener
 *     países seleccionados sin estar viendo la comparación
 *     (la barra flotante está visible pero no hizo click en "Compare").
 *
 * No necesitamos un campo `maxItems` en el estado. El límite de 3
 * se valida en la acción toggleComparisonCountry(). Mantener el
 * estado como datos puros sin lógica de negocio incrustada.
 */
export interface ComparisonSliceState {
  readonly selectedCodes: string[];
  readonly isActive: boolean;
}

export type ComparisonStore = Store<ComparisonSliceState>;

export const createComparisonSlice = (): ComparisonStore =>
  createStore<ComparisonSliceState>({
    selectedCodes: [],
    isActive: false,
  });
