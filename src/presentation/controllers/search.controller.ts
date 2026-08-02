import { setSearchQuery } from "@/presentation/state/countryState";
import { debounce } from "@/shared/debounce";

/** Controlador de Busqueda
 * Inicializa el input de búsqueda y aplica un debounce para no saturar el estado con cada letra.
 * @returns void
 */
export const initSearchController = (): void => {
  const inputSearch = document.querySelector<HTMLInputElement>("#search-input");
  if (!inputSearch) return;

  const optimizedSearch = debounce((text: string) => setSearchQuery(text), 350);
  inputSearch.addEventListener("input", (e) => {
    optimizedSearch((e.target as HTMLInputElement).value);
  });
};
