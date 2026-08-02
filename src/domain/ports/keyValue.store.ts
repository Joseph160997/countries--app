/**
 * Puerto: persistencia clave/valor síncrona.
 * Hoy lo implementa localStorage; mañana podría ser
 * otra tecnología sin tocar a los consumidores.
 */
export interface KeyValueStore {
  get<T>(key: string): T | null;
  save<T>(key: string, value: T): void;
  remove(key: string): void;
}
