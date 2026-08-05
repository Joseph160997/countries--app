import "@/presentation/styles/style.css";
import { initializeLayout } from "@/presentation/components/layout";
import {
  initCountryState,
  initSort,
  initWeatherProvider,
  initWikiProvider,
  loadCountries,
} from "@/presentation/state/countryState";
import { RestCountriesRepository } from "@/infrastructure/api/restCountries/country.repository";
import { getFavoriteCodes } from "@/presentation/services/favoriteService";
import { isErr, unwrapOr } from "@/shared/result";
import { initRenderer } from "@/presentation/renderers/ui.renderer";
import { initSearchController } from "@/presentation/controllers/search.controller";
import { initFilterController } from "@/presentation/controllers/filter.controller";
import { initGridController } from "@/presentation/controllers/grid.controller";
import { initModalController } from "@/presentation/controllers/modal.controller";
import { initPaginationController } from "@/presentation/controllers/pagination.controller";
import { initThemeController } from "@/presentation/controllers/theme.controller";
import { OpenMeteoProvider } from "@/infrastructure/api/openMeteo/openMeteo.provider";
import { WikipediaProvider } from "@/infrastructure/api/wikipedia/wikipedia.provider";

// ========================================================
// 1. LAYOUT + COMPOSITION ROOT
// ========================================================
initializeLayout("app");
initCountryState(new RestCountriesRepository());
initWeatherProvider(new OpenMeteoProvider());
initWikiProvider(new WikipediaProvider());

// ========================================================
// 2. PRESENTACIÓN (el orden importa: renderer antes que controllers)
// ========================================================
initRenderer();
initSearchController();
initFilterController();
initGridController();
initModalController();
initPaginationController();
initThemeController();

// ========================================================
// 3. BOOTSTRAP
// ========================================================
const startApp = async (): Promise<void> => {
  initSort();

  const favsResult = getFavoriteCodes();
  if (isErr(favsResult)) {
    console.warn(
      "[Favorites] Corrupt data detected, starting with an empty list:",
      favsResult.error.message,
    );
  }
  const savedFavorites = unwrapOr(favsResult, []);

  try {
    await loadCountries(savedFavorites);
  } catch (error) {
    console.error("[Main] Error crítico durante el arranque:", error);
  }
};

startApp();
