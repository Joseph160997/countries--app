/**
 * Realiza una petición HTTP utilizando fetch con validación y timeout.
 * Implementa un enfoque robusto para manejar errores comunes y validar la respuesta sin depender de bibliotecas externas.
 *
 * @template T - El tipo de datos esperado en la respuesta, definido por el consumidor de la función.
 * @param url - La URL a la que se realizará la petición.
 * @param options - Opciones extendidas de RequestInit con un validador opcional.
 * @param timeout - Tiempo máximo en milisegundos antes de abortar la petición (default: 8000ms).
 * @return Promise<T> - Una promesa que se resuelve con los datos tipados como T o se rechaza con un error detallado.
 */
export const httpClient = async <T>(
  url: string,
  // Extendemos RequestInit para incluir un validador opcional
  options?: RequestInit & { validator?: (data: unknown) => data is T },
  timeout: number = 8000,
): Promise<T> => {
  // 1. Validación de URL: Se asegura de que sea una URL válida antes de procesar [3]
  try {
    if (url.startsWith("http")) new URL(url);
  } catch {
    throw new Error(`La URL proporcionada no es válida: ${url}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // 2. Combinación de señales: Permite que la petición sea abortada
    // por el timeout o por una señal externa pasada en options [4, 5]
    const signal = options?.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal;

    const response = await fetch(url, { ...options, signal });

    // 3. Validación de estado HTTP [5]
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 4. Alternativa a Zod: Validación mediante Type Guard [1, 2]
    // Si se provee una función validadora, se ejecuta para asegurar la integridad de T
    if (options?.validator && !options.validator(data)) {
      throw new Error(
        "La respuesta del servidor no coincide con el formato esperado.",
      );
    }

    return data as T;
  } catch (error) {
    // 5. Manejo de errores específicos [6, 7]
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `Petición abortada: se excedió el tiempo límite de ${timeout}ms.`,
      );
    }

    throw error instanceof Error
      ? error
      : new Error(`Error inesperado al acceder a ${url}`);
  } finally {
    // 6. Limpieza garantizada: El timeout se limpia siempre,
    // ocurra un error o no, evitando fugas de memoria [6, 8]
    clearTimeout(timeoutId);
  }
};
