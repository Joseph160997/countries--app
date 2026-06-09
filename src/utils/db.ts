/**
 * Servicio de persistencia utilizando la Web API nativa IndexedDB.
 * Implementa el Patrón Singleton y Genéricos para máxima reutilización.
 */

// 1. Configuración y Tipado Inicial
const DB_NAME = "CountriesAppDB";
const DB_VERSION = 1;

// Definimos los nombres de los almacenes permitidos para evitar errores de dedo
export type StoreName = "countries" | "settings";

// Patrón Singleton: Mantenemos una única instancia de conexión [3]
let dbInstance: IDBDatabase | null = null;

/**
 * Abre la conexión con la base de datos y configura la estructura.
 */
const initDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Se ejecuta solo si la versión cambia o es la primera vez [4]
    request.onupgradeneeded = () => {
      const db = request.result;

      // Creamos la tabla de países con 'cca3' como llave primaria [5]
      if (!db.objectStoreNames.contains("countries")) {
        db.createObjectStore("countries", { keyPath: "cca3" });
      }

      // Creamos la tabla de ajustes con 'id' como llave primaria
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
};

/**
 * Utilerías para convertir eventos de IndexedDB en Promesas modernas [6, 7]
 */
const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const transactionToPromise = (transaction: IDBTransaction): Promise<void> => {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error || new Error("Transacción abortada"));
    transaction.onerror = () => reject(transaction.error);
  });
};

/**
 * Interfaz de Almacenamiento Genérica (CRUD)
 */
export const storage = {
  /**
   * Guarda o actualiza un objeto en el almacén especificado.
   * @param storeName - Nombre del almacén ('countries' | 'settings')
   * @param item - El objeto a guardar (debe coincidir con el keyPath del almacén)
   */
  async save<T>(storeName: StoreName, item: T): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.put(item); // 'put' inserta o sobrescribe si la llave ya existe [5]
    return transactionToPromise(transaction);
  },

  /**
   * Recupera uno o todos los elementos de un almacén.
   * @param storeName - Nombre del almacén
   * @param key - (Opcional) Llave primaria para buscar un elemento específico
   */
  async get<T>(storeName: StoreName, key?: string): Promise<T | T[]> {
    const db = await initDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = key ? store.get(key) : store.getAll();
    return requestToPromise(request) as Promise<T | T[]>;
  },

  /**
   * Elimina un registro específico por su llave.
   */
  async delete(storeName: StoreName, key: string): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).delete(key);
    return transactionToPromise(transaction);
  },

  /**
   * Limpia todos los datos de un almacén específico.
   */
  async clear(storeName: StoreName): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).clear();
    return transactionToPromise(transaction);
  },
};
