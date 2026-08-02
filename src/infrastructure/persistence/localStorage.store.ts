import type { KeyValueStore } from "@/domain/ports/keyValue.store";

/**
 * Servici unicificado para la gestión de favoritos usando localStorage.
 * Este módulo actúa como una capa de abstracción, permitiendo cambiar la implementación
 * de almacenamiento en el futuro sin afectar al resto de la aplicación.
 */
export const storageService: KeyValueStore = {
  /**
   * Guarda un valor de cualquier tipo en localStorage.
   * @param key - La clave del valor a guardar.
   * @param data - El valor a guardar (puede ser de cualquier tipo).
   */
  save: <T>(key: string, data: T): void => {
    // Validamos que exista la clave y el dato antes de intentar guardar
    if (!key || data === undefined) {
      console.warn("[StorageService] Clave o dato no válido para guardar.");
      return;
    }

    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error("[StorageService] Error al guardar el dato:", error);
    }
  },

  /**
   * Recupera un valor de localStorage y lo deserializa.
   * @param key - La clave del valor a recuperar.
   * @return El valor recuperado o null si no existe o si ocurre un error.
   */
  get: <T>(key: string): T | null => {
    const raw = localStorage.getItem(key);

    // Narrowing: Si no hay valor, retornamos null directamente
    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error("[StorageService] Error al obtener el dato:", error);
      return null;
    }
  },

  /**
   * Elimina un valor de localStorage.
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
