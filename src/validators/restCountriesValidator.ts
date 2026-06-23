import type {
  RestCountryDTO,
  RestCountriesResponse,
} from "../types/RestCountryDTO";

/** * Comprueba que un valor sea un objeto válido. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** * Comprueba que un valor sea un array de strings. */
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/** * Comprueba que un valor sea un objeto RestCountryDTO. */
function isCodes(value: unknown): boolean {
  return isObject(value) && typeof value.alpha_3 === "string";
}

/**
 *
 * @param value
 * @returns
 */
function isNames(value: unknown): boolean {
  return isObject(value) && typeof value.common === "string";
}

/**
 * comprueba que un valor sea un objeto Flag
 * @param value
 * @returns
 */
function isFlag(value: unknown): boolean {
  if (!isObject(value)) return false;
  const hasSvg = typeof value.url_svg === "string";
  const hasPng = typeof value.url_png === "string";
  return hasSvg || hasPng;
}

/**
 * Comprueba que un valor sea un objeto Capital
 */
function isCapital(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.name === "string" &&
    (value.primary === undefined || typeof value.primary === "boolean")
  );
}

/** comprueba que un valor sea un objeto Language */
function isLanguage(value: unknown): boolean {
  return isObject(value) && typeof value.name === "string";
}

/** comproba que un valor sea un objeto Currency
 */
function isCurrency(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.name === "string" &&
    typeof value.symbol === "string"
  );
}

/**
 * Comprueba que un valor sea un objeto RestCountryDTO.
 * @param value
 * @returns
 */
function isRestCountryDTO(value: unknown): value is RestCountryDTO {
  if (!isObject(value)) return false;
  return (
    isCodes(value.codes) &&
    isNames(value.names) &&
    isFlag(value.flag) &&
    typeof value.population === "number" &&
    typeof value.region === "string" &&
    (value.subregion === undefined || typeof value.subregion === "string") &&
    (value.borders === undefined || isStringArray(value.borders)) &&
    (value.tlds === undefined || isStringArray(value.tlds)) &&
    (value.capitals === undefined ||
      (Array.isArray(value.capitals) && value.capitals.every(isCapital))) &&
    (value.languages === undefined ||
      (Array.isArray(value.languages) && value.languages.every(isLanguage))) &&
    (value.currencies === undefined ||
      (Array.isArray(value.currencies) && value.currencies.every(isCurrency)))
  );
}

/**
 * Comprueba que un valor sea un objeto RestCountriesResponse.
 * @param value
 * @returns
 */
export function isRestCountriesResponse(
  value: unknown,
): value is RestCountriesResponse {
  if (!isObject(value)) return false;
  if (!isObject(value.data)) return false;
  if (!Array.isArray(value.data.objects)) return false;
  return value.data.objects.every(isRestCountryDTO);
}
