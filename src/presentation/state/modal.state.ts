import type { Country } from "@/domain/country";
import type { WeatherProvider } from "@/domain/ports/weather.provider";
import type { WikiProvider } from "@/domain/ports/wiki.provider";
import { isOk } from "@/shared/result";
import { createModalSlice, type ModalStore } from "../slices/modal.slice";

/**
 * Dependencias del estado del modal.
 * El modal no conoce el catálogo: recibe funciones de acceso
 * inyectadas por la fachada (findCountry, getAllCountries).
 */
export interface ModalDeps {
  readonly notify: () => void;
  readonly findCountry: (cca3: string) => Country | undefined;
  readonly getAllCountries: () => readonly Country[];
}

/**
 * Estado del modal de detalle: país seleccionado, clima y wiki.
 *
 * Cada apertura crea un AbortController de sesión: si el usuario
 * cierra el modal (o abre OTRO país) mientras un fetch vuela,
 * la petición se aborta y su resultado se descarta.
 */
export const createModalState = ({
  notify,
  findCountry,
  getAllCountries,
}: ModalDeps) => {
  const modalStore: ModalStore = createModalSlice();

  let weatherProvider: WeatherProvider | null = null;
  let wikiProvider: WikiProvider | null = null;

  /** AbortController de la sesión activa del modal. */
  let sessionController: AbortController | null = null;

  // ─── Inicialización de dependencias ───
  const initWeatherProvider = (provider: WeatherProvider): void => {
    weatherProvider = provider;
  };

  const initWikiProvider = (provider: WikiProvider): void => {
    wikiProvider = provider;
  };

  // ─── Selectores ───
  const getSelectedCountry = (): Country | null =>
    modalStore.getState().selectedCountry;

  const getWeather = () => modalStore.getState().weather;
  const getWeatherStatus = () => modalStore.getState().weatherStatus;
  const getWiki = () => modalStore.getState().wiki;
  const getWikiStatus = () => modalStore.getState().wikiStatus;

  // ─── Acciones ───
  const openCountryModal = (cca3: string): void => {
    const country = findCountry(cca3);
    if (!country) return;

    // Aborta los fetches de la sesión anterior y arranca una nueva.
    sessionController?.abort();
    sessionController = new AbortController();
    const { signal } = sessionController;

    const willFetchWeather = Boolean(
      weatherProvider && country.capitalCoordinates,
    );
    const willFetchWiki = Boolean(wikiProvider && country.links?.wikipedia);

    modalStore.setState({
      selectedCountry: country,
      weather: null,
      weatherStatus: willFetchWeather ? "loading" : "idle",
      wiki: null,
      wikiStatus: willFetchWiki ? "loading" : "idle",
    });
    notify();

    if (willFetchWeather) void loadWeather(country, signal);
    if (willFetchWiki) void loadWiki(country, signal);
  };

  const closeCountryModal = (): void => {
    sessionController?.abort();
    sessionController = null;

    modalStore.setState({
      selectedCountry: null,
      weather: null,
      weatherStatus: "idle",
      wiki: null,
      wikiStatus: "idle",
    });
    notify();
  };

  const loadWeather = async (
    country: Country,
    signal: AbortSignal,
  ): Promise<void> => {
    if (!weatherProvider || !country.capitalCoordinates) return;
    const { lat, lng } = country.capitalCoordinates;
    const result = await weatherProvider.getCurrentWeather(lat, lng, signal);

    // Guard de cancelación: la sesión se cerró/reabrió mientras el
    // fetch volaba. Descartamos el resultado sin tocar el estado.
    if (signal.aborted) return;

    // Guard de carrera: el usuario abrió OTRO país mientras el fetch volaba.
    if (modalStore.getState().selectedCountry?.cca3 !== country.cca3) return;

    if (isOk(result)) {
      modalStore.setState({ weather: result.value, weatherStatus: "ready" });
    } else {
      modalStore.setState({ weatherStatus: "error" });
    }
    notify();
  };

  const loadWiki = async (
    country: Country,
    signal: AbortSignal,
  ): Promise<void> => {
    const url = country.links?.wikipedia;
    if (!wikiProvider || !url) return;
    const result = await wikiProvider.getSummaryFromUrl(url, signal);

    // Mismo principio de guard que con el clima.
    if (signal.aborted) return;
    if (modalStore.getState().selectedCountry?.cca3 !== country.cca3) return;

    if (isOk(result)) {
      modalStore.setState({ wiki: result.value, wikiStatus: "ready" });
    } else {
      modalStore.setState({ wikiStatus: "error" });
    }
    notify();
  };

  // ─── País aleatorio ───

  /**
   * Selecciona un cca3 aleatorio del catálogo cargado.
   *
   * Retorna `string | null`:
   * - `null` cuando el catálogo está vacío (cargando o error).
   *   El caller decide qué hacer (no-op, deshabilitar botón, etc.)
   *
   * Heurística anti-repetición:
   * - Si hay un país abierto en el modal, lo excluye del pool
   *   para que clicks consecutivos no devuelvan el mismo país.
   * - Si solo queda 1 país en el pool (catálogo de 1), lo devuelve igual.
   *
   * Nota: usamos Math.random() porque esto es exploración visual,
   * no seguridad. crypto.getRandomValues sería over-engineering.
   */
  const getRandomCca3 = (): string | null => {
    const all = getAllCountries();

    // Catálogo vacío → no hay nada que elegir.
    // Devolvemos null (valor) en vez de lanzar excepción (flujo esperado).
    if (all.length === 0) return null;

    // Catálogo con 1 solo país → siempre devuelve ese.
    // No aplicamos el filtro anti-repetición porque el pool quedaría vacío.
    if (all.length === 1) return all[0].cca3;

    // Excluimos el país actualmente abierto (si hay uno).
    const currentCca3 = getSelectedCountry()?.cca3;

    // filter() crea un nuevo array — no mutamos `all`.
    // Inmutabilidad: principio base de nuestro store.
    const pool = all.filter((c) => c.cca3 !== currentCca3);

    // Si el filter vació el pool (imposible con length > 1, pero
    // defensivamente), caemos al catálogo completo.
    const target = pool.length > 0 ? pool : all;

    // Índice aleatorio: Math.floor trunca hacia abajo,
    // Math.random() ∈ [0, 1) → nunca llega a target.length.
    const index = Math.floor(Math.random() * target.length);
    return target[index].cca3;
  };

  /**
   * Acción: elige un país aleatorio y abre el modal.
   * Si es null (catálogo vacío), simplemente no hacemos nada.
   */
  const openRandomCountry = (): void => {
    const cca3 = getRandomCca3();
    if (cca3) openCountryModal(cca3);
  };

  const reset = (): void => {
    sessionController?.abort();
    sessionController = null;
    modalStore.reset();
  };

  return {
    initWeatherProvider,
    initWikiProvider,
    getSelectedCountry,
    getWeather,
    getWeatherStatus,
    getWiki,
    getWikiStatus,
    openCountryModal,
    closeCountryModal,
    getRandomCca3,
    openRandomCountry,
    reset,
  };
};

export type ModalState = ReturnType<typeof createModalState>;
