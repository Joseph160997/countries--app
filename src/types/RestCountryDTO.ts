/**
 * @fileoverview DTO (Data Transfer Object)
 * Representa la estructura cruda de la API REST Countries v5.
 * @see https://restcountries.com/docs
 *
 * La respuesta viene envuelta en { data: { objects: RestCountryDTO[], meta: {...} } }
 * Este DTO representa un único objeto dentro de data.objects.
 */

// ======================================================
// RESPONSE WRAPPER
// (lo que devuelve el fetch antes de desempaquetar)
// ======================================================

export interface RestCountriesResponse {
  readonly data: {
    readonly objects: RestCountryDTO[];
    readonly meta: {
      readonly total: number;
      readonly count: number;
      readonly limit: number; // <=== Limitado a 250
      readonly offset: number; //
      readonly more: boolean;
    };
  };
}

// ======================================================
// DTO PRINCIPAL
// ======================================================

export interface RestCountryDTO {
  // --------------------------------------------------
  // Nombres
  // --------------------------------------------------
  readonly names: {
    readonly common: string;
    readonly official: string;
    readonly alternates?: string[];
    readonly native?: Record<
      string,
      { readonly common: string; readonly official: string }
    >;
    // Omitimos names.translations: objeto muy pesado (50+ idiomas),
    // poco útil para la UI y excluido del aggregate "name" de la API.
  };

  // --------------------------------------------------
  // Códigos
  // --------------------------------------------------
  readonly codes: {
    readonly alpha_2: string;
    readonly alpha_3: string;
    readonly ccn3?: string; // Código numérico ISO 3166-1
    readonly fifa?: string;
    readonly cioc?: string; // Código Comité Olímpico Internacional
  };

  // --------------------------------------------------
  // Bandera
  // v3.1: flags: { svg, png, alt }
  // v5:   flag: { url_svg, url_png, emoji, description, ... }
  // --------------------------------------------------
  readonly flag: {
    readonly emoji?: string;
    readonly url_svg: string;
    readonly url_png: string;
    // Útil como atributo alt en <img> para accesibilidad
    readonly description?: string;
  };

  // --------------------------------------------------
  // Geografía y demografía
  // --------------------------------------------------
  readonly region: string; // Nombre de la región
  readonly subregion?: string;
  readonly continents?: string[];
  readonly borders?: string[]; // Códigos alpha_3 de países fronterizos
  readonly landlocked?: boolean;
  readonly area?: {
    readonly kilometers: number;
    readonly miles: number;
  };
  readonly coordinates?: {
    readonly lat: number;
    readonly lng: number;
  };

  // --------------------------------------------------
  // Capitales
  // --------------------------------------------------
  readonly capitals?: Array<{
    readonly name: string;
    readonly primary?: boolean;
    readonly coordinates?: {
      readonly lat: number;
      readonly lng: number;
    };
  }>;

  // --------------------------------------------------
  // Demografía
  // "dynamic" en v5: se sincroniza cada 4h desde fuentes oficiales.
  // --------------------------------------------------
  readonly population: number;

  // --------------------------------------------------
  // Idiomas y monedas
  // --------------------------------------------------
  readonly languages?: Array<{
    readonly name: string;
    readonly bcp47: string; // e.g. "es", "en"
  }>;

  readonly currencies?: Array<{
    readonly code: string;
    readonly name: string;
    readonly symbol: string;
  }>;

  // En v5 son arrays de objetos, más fáciles de iterar.

  // --------------------------------------------------
  // Llamadas internacionales
  // --------------------------------------------------
  readonly calling_codes?: string[];

  // --------------------------------------------------
  // Información extendida (útil para modales/detalle)
  // --------------------------------------------------
  readonly timezones?: string[];
  readonly tlds?: string[];
  readonly car?: {
    readonly driving_side: "left" | "right";
    readonly signs?: string[];
  };
  readonly links?: {
    readonly google_maps?: string;
    readonly open_street_maps?: string;
    readonly wikipedia?: string;
  };

  // --------------------------------------------------
  // Membresías (nuevo en v5, no existía en v3.1)
  // --------------------------------------------------
  readonly memberships?: {
    readonly un?: boolean;
    readonly eu?: boolean;
    readonly nato?: boolean;
    readonly g7?: boolean;
    readonly g20?: boolean;
    readonly schengen?: boolean;
  };
}
