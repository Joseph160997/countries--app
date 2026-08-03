/**
 * Núcleo de store: la unidad reactiva mínima de la aplicación.
 *
 * El patrón que converge en el frontend moderno (Zustand, Redux, Signals):
 * una fuente de verdad por dominio, actualizaciones inmutables, y
 * suscriptores que reciben (next, prev) para decidir qué repintar.
 *
 * Sin frameworks, sin magia: lo que pasa es lo que lees.
 */

/** Función de desuscripción. Tipo nombrado para firmas legibles. */
export type Unsubscribe = () => void;

/**
 * El suscriptor recibe el estado NUEVO y el ANTERIOR.
 * Con `prev`, un renderer puede repintar solo lo que cambió.
 */
export type StoreListener<T> = (state: Readonly<T>, prev: Readonly<T>) => void;

export interface Store<T extends object> {
  /** Snapshot actual del estado. */
  getState(): Readonly<T>;

  /**
   * Actualización inmutable. Acepta un objeto parcial o una función
   * que lo produce. Si nada cambió realmente, NO notifica.
   */
  setState(update: Partial<T> | ((prev: Readonly<T>) => Partial<T>)): void;

  /** Registra un suscriptor. Retorna la función para desuscribirse. */
  subscribe(listener: StoreListener<T>): Unsubscribe;

  /** Restaura el estado a sus valores iniciales (tests y reseteos). */
  reset(): void;
}

export const createStore = <T extends object>(initialState: T): Store<T> => {
  let state: T = { ...initialState };
  const listeners = new Set<StoreListener<T>>();

  const getState = (): Readonly<T> => state;

  const setState = (
    update: Partial<T> | ((prev: Readonly<T>) => Partial<T>),
  ): void => {
    const partial = typeof update === "function" ? update(state) : update;

    // Comparación superficial: notificar solo si algo cambió DE VERDAD.
    // setSearchQuery("col") dos veces seguidas → la segunda no repinta nada.
    const hasChanges = Object.entries(partial).some(
      ([key, value]) => !Object.is(state[key as keyof T], value),
    );
    if (!hasChanges) return;

    const prev = state;
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener(state, prev));
  };

  const subscribe = (listener: StoreListener<T>): Unsubscribe => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const reset = (): void => {
    const prev = state;
    state = { ...initialState };
    listeners.forEach((listener) => listener(state, prev));
  };

  return { getState, setState, subscribe, reset };
};
