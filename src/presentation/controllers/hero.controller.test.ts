import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/presentation/state/countryState", () => ({
  openCountryModal: vi.fn(),
}));

import { initHeroCarousel } from "./hero.controller";
import { openCountryModal } from "@/presentation/state/countryState";

describe("initHeroCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("opens the selected country modal even when there is only one slide", () => {
    document.body.innerHTML = `
      <div id="hero-container">
        <div class="hero-slide is-active">
          <button class="btn-hero-explore" data-id="COL">Explore</button>
        </div>
      </div>
    `;

    initHeroCarousel();
    document
      .querySelector(".btn-hero-explore")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(openCountryModal).toHaveBeenCalledWith("COL");
  });
});
