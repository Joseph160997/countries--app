/**
 * Utilidad de Rendimiento: Debounce (Antirrebote).
 * Retrasa la ejecución de una función hasta que haya pasado un tiempo de inactividad.
 * @param func - La función original que queremos retrasar.
 * @param wait - El tiempo de espera en milisegundos.
 * @param immediate - Opción de ejecución inmediata.
 * @returns Una nueva versión de la función con el superpoder de retraso.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false, // Mejora: Opción de ejecución inmediata
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Función "debounced" que se ejecutará en lugar de la función original.
   * @param args - Argumentos que se pasarán a la función original cuando se ejecute.
   */
  const debounced = (...args: Parameters<T>): void => {
    // Si se solicita ejecución inmediata y no hay un timeout activo, ejecutamos la función de inmediato
    const callNow = immediate && !timeoutId;

    // Si ya hay un timeout activo, lo limpiamos para reiniciar el conteo
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Establecemos un nuevo timeout para ejecutar la función después del tiempo de espera
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func(...args);
    }, wait);

    // Si se solicitó ejecución inmediata y no había un timeout activo, ejecutamos la función de inmediato
    if (callNow) func(...args);
  };

  // Mejora: Método para cancelar manualmente el debounce
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};
