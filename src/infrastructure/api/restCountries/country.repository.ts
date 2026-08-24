import type { Country } from "@/domain/country";
import type { CountryRepository } from "@/domain/ports/country.repository";
import type { AppError } from "@/domain/errors";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
import type { RestCountriesResponse, RestCountryDTO } from "./restCountry.dto";
import { mapToCountry, unwrapResponse } from "./country.mapper";
import { isRestCountriesResponse } from "./restCountries.validator";
import { httpClient } from "@/infrastructure/http/http.client";
import { storage } from "@/infrastructure/persistence/indexedDb.store";
import { storageService } from "@/infrastructure/persistence/localStorage.store";

const CACHE_KEY = "countries_last_fetch";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h
const API_KEY = import.meta.env.VITE_COUNTRIES_API_KEY;
const BASE_URL = "https://api.restcountries.com/countries/v5";
const REQUIRED_FIELDS = [
  "codes",
  "names",
  "flag",
  "population",
  "region",
  "capitals",
  "subregion",
  "borders",
  "languages",
  "currencies",
  "tlds",
  // ── Fase 3: datos de ficha ──
  "area",
  "coordinates",
  "landlocked",
  "timezones",
  "calling_codes",
  "car",
  "links",
  "memberships",
].join(",");

const options = {
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

/**
 * Adapter: implementación concreta del puerto CountryRepository
 * contra la API REST Countries v5 con estrategia cache-first.
 *
 * El dominio no sabe que existimos. Solo sabe que "algo"
 * le entrega Result<Country[], AppError>.
 */
export class RestCountriesRepository implements CountryRepository {
  async getAll(
    favoriteCodes: readonly string[],
  ): Promise<Result<Country[], AppError>> {
    // 1. Cache-first: datos frescos en local → sin tocar la red
    if (this.isCacheValid()) {
      const cached = await this.readCache(favoriteCodes);
      if (cached) {
        console.log(
          `[Cache] ✅ Sirviendo ${cached.length} países desde IndexedDB`,
        );
        return ok(cached);
      }
    }

    // 2. Red con paginación
    console.log("[Network] Iniciando fetch desde la API...");
    try {
      const countries = await this.fetchAllPages(favoriteCodes);
      console.log(`[Network] ✅ ${countries.length} países cargados`);

      // Persistencia fire-and-forget: no bloquea la respuesta
      storage.saveAll<Country>("countries", countries).catch(console.error);
      storageService.save(CACHE_KEY, Date.now());

      return ok(countries);
    } catch (error) {
      console.error("[Network] ❌ Fallo de red:", error);

      // 3. Último recurso: caché expirado
      const stale = await this.readCache(favoriteCodes);
      if (stale) {
        console.warn(
          `[Cache] ⚠️ Sirviendo caché expirado (${stale.length} países)`,
        );
        return ok(stale);
      }

      return err({
        kind: "network",
        message: "No hay conexión ni datos locales disponibles.",
        cause: error,
      });
    }
  }

  /** Lee el caché y re-aplica los favoritos actuales. null si es inutilizable. */
  private async readCache(
    favoriteCodes: readonly string[],
  ): Promise<Country[] | null> {
    try {
      const cached = await storage.get<Country>("countries");
      const list = Array.isArray(cached) ? cached : [cached];
      if (list.length === 0) return null;
      return list.map((c) => ({
        ...c,
        isFavorite: favoriteCodes.includes(c.cca3),
      }));
    } catch (dbError) {
      console.warn("[Cache] IndexedDB falló, yendo a la red:", dbError);
      return null;
    }
  }

  /** Pagina la API (máx. 250 por request) y mapea DTO → Country. */
  private async fetchAllPages(
    favoriteCodes: readonly string[],
  ): Promise<Country[]> {
    const LIMIT = 100;
    let offset = 0;
    let hasMore = true;
    const allDtos: RestCountryDTO[] = [];

    while (hasMore) {
      const url = `${BASE_URL}?response_fields=${REQUIRED_FIELDS}&limit=${LIMIT}&offset=${offset}`;
      console.log(`[Network] Fetching offset=${offset}...`);
      const rawResponse = await httpClient<RestCountriesResponse>(url, {
        ...options,
        validator: isRestCountriesResponse,
      });
      allDtos.push(...unwrapResponse(rawResponse));
      hasMore = rawResponse.data.meta.more;
      offset += LIMIT;
      console.log(
        `[Network] Acumulados: ${allDtos.length} / ${rawResponse.data.meta.total}`,
      );
    }

    const CHUNK_SIZE = 50;
    const countries: Country[] = [];

    for (let i = 0; i < allDtos.length; i += CHUNK_SIZE) {
      const chunk = allDtos.slice(i, i + CHUNK_SIZE);
      countries.push(...chunk.map((dto) => mapToCountry(dto, favoriteCodes)));

      // Ceder el hilo principal entre chunks
      if (i + CHUNK_SIZE < allDtos.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return countries;
  }

  /** El caché es válido si tiene menos de 24h. */
  private isCacheValid(): boolean {
    const lastFetch = storageService.get<number>(CACHE_KEY);
    if (!lastFetch) {
      console.log("[Cache] Sin timestamp — caché inválido");
      return false;
    }
    const ageInMinutes = Math.round((Date.now() - lastFetch) / 1000 / 60);
    const isValid = Date.now() - lastFetch < CACHE_TTL;
    console.log(
      `[Cache] Edad del caché: ${ageInMinutes} minutos — ${isValid ? "✅ válido" : "❌ expirado"}`,
    );
    return isValid;
  }
}
