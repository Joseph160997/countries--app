import type { Country, CountryLinks, GeoPoint, Region } from "@/domain/country";
import { isRegion } from "@/domain/country";

export const MAX_CACHED_COUNTRIES = 400;

const MAX_TEXT_LENGTH = 500;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.length <= MAX_TEXT_LENGTH;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length <= MAX_CACHED_COUNTRIES &&
  value.every(isString);

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isGeoPoint = (value: unknown): value is GeoPoint =>
  isObject(value) &&
  typeof value.lat === "number" &&
  Number.isFinite(value.lat) &&
  typeof value.lng === "number" &&
  Number.isFinite(value.lng);

const isCountryLinks = (value: unknown): value is CountryLinks =>
  isObject(value) &&
  (value.googleMaps === undefined || isString(value.googleMaps)) &&
  (value.openStreetMaps === undefined || isString(value.openStreetMaps)) &&
  (value.wikipedia === undefined || isString(value.wikipedia));

const isValidRegion = (value: unknown): value is Region =>
  typeof value === "string" && isRegion(value);

export const isCountry = (value: unknown): value is Country => {
  if (!isObject(value)) return false;

  return (
    typeof value.cca3 === "string" &&
    /^[A-Z]{3}$/.test(value.cca3) &&
    isString(value.name) &&
    isString(value.flag) &&
    isString(value.flagAlt) &&
    isFiniteNonNegativeNumber(value.population) &&
    isValidRegion(value.region) &&
    isString(value.capital) &&
    typeof value.isFavorite === "boolean" &&
    isString(value.subregion) &&
    isStringArray(value.borders) &&
    isStringArray(value.languages) &&
    isStringArray(value.currencies) &&
    isStringArray(value.tld) &&
    (value.areaKm2 === undefined || isFiniteNonNegativeNumber(value.areaKm2)) &&
    (value.density === undefined || isFiniteNonNegativeNumber(value.density)) &&
    (value.coordinates === undefined || isGeoPoint(value.coordinates)) &&
    (value.capitalCoordinates === undefined ||
      isGeoPoint(value.capitalCoordinates)) &&
    (value.timezones === undefined || isStringArray(value.timezones)) &&
    (value.callingCodes === undefined || isStringArray(value.callingCodes)) &&
    (value.drivingSide === undefined ||
      value.drivingSide === "left" ||
      value.drivingSide === "right") &&
    (value.landlocked === undefined || typeof value.landlocked === "boolean") &&
    (value.memberships === undefined || isStringArray(value.memberships)) &&
    (value.links === undefined || isCountryLinks(value.links))
  );
};
