import { describe, expect, it } from "vitest";
import { renderCountryCard, renderCountryDetailModal } from "./countryCards";
import { renderComparisonView } from "./comparisonView";

const makeCountry = (overrides = {}) => ({
  cca2: "CO",
  cca3: "COL",
  name: "Colombia",
  flag: "https://example.com/flag.png",
  flagAlt: "Flag of Colombia",
  population: 52000000,
  region: "Americas" as const,
  capital: "Bogotá",
  isFavorite: false,
  subregion: "South America",
  borders: ["BRA", "PER"],
  languages: ["Spanish"],
  currencies: ["COP"],
  tld: [".co"],
  ...overrides,
});

describe("HTML escaping in renderers", () => {
  it("escapes user-controlled text in country cards", () => {
    const html = renderCountryCard(
      makeCountry({
        name: '<script>alert("x")</script>',
        capital: "B&Q",
        region: "Americas",
      }),
    );

    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("B&amp;Q");
  });

  it("escapes user-controlled text in comparison view", () => {
    const html = renderComparisonView({
      countries: [makeCountry({ name: 'An & "special" country' })],
      rows: [
        {
          label: "Population & <span>test</span>",
          values: ["10M"],
        },
      ],
    });

    expect(html).toContain("An &amp; &quot;special&quot; country");
    expect(html).toContain("Population &amp; &lt;span&gt;test&lt;/span&gt;");
  });

  it("escapes modal content and border labels", () => {
    const html = renderCountryDetailModal(
      makeCountry({
        name: "A <script>bad</script> country",
        capital: "T&T",
      }),
      ["<b>Brazil</b>"],
    );

    expect(html).toContain("A &lt;script&gt;bad&lt;/script&gt; country");
    expect(html).toContain("T&amp;T");
    expect(html).toContain("&lt;b&gt;Brazil&lt;/b&gt;");
  });

  it("escapes wiki extract and exposes accessible modal/card semantics", () => {
    const cardHtml = renderCountryCard(
      makeCountry({ name: "C<em>ol</em>ombia" }),
    );

    expect(cardHtml).toContain(
      'aria-label="Open country C&lt;em&gt;ol&lt;/em&gt;ombia"',
    );
    expect(cardHtml).toContain('tabindex="0"');
    expect(cardHtml).toContain(
      'aria-label="Toggle favorite for C&lt;em&gt;ol&lt;/em&gt;ombia"',
    );

    const modalHtml = renderCountryDetailModal(
      makeCountry({
        name: "A <script>bad</script> country",
      }),
      [],
      null,
      "idle",
      {
        extract: "This is <script>alert(1)</script>",
        pageUrl: "https://en.wikipedia.org/wiki/Test?x=<script>",
        thumbnail: "https://example.com/thumb.jpg",
      },
      "ready",
    );

    expect(modalHtml).toContain('role="dialog"');
    expect(modalHtml).toContain('aria-modal="true"');
    expect(modalHtml).toContain(
      "This is &lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(modalHtml).toContain(
      'href="https://en.wikipedia.org/wiki/Test?x=&lt;script&gt;"',
    );
  });

  it("drops unsafe URLs before embedding them in HTML", () => {
    const cardHtml = renderCountryCard(
      makeCountry({
        flag: "javascript:alert(1)",
        name: "Evil <b>Country</b>",
      }),
    );

    expect(cardHtml).toContain('src=""');
    expect(cardHtml).toContain("Evil &lt;b&gt;Country&lt;/b&gt;");

    const modalHtml = renderCountryDetailModal(
      makeCountry({
        name: "XSS Country",
        links: {
          googleMaps: "javascript:alert(1)",
          openStreetMaps: "https://example.com/map",
          wikipedia: "data:text/html,<script>alert(1)</script>",
        },
      }),
      ["Neighbor"],
      {
        temperatureC: 20,
        humidity: 50,
        windSpeedKmh: 10,
        condition: "Sunny",
        icon: '<svg onload="alert(1)"></svg>',
      },
      "ready",
      {
        extract: "Wiki summary",
        pageUrl: "javascript:alert(2)",
        thumbnail: "javascript:alert(3)",
      },
      "ready",
    );

    expect(modalHtml).not.toContain("javascript:alert");
    expect(modalHtml).not.toContain("data:text/html");
    expect(modalHtml).toContain(
      "&lt;svg onload=&quot;alert(1)&quot;&gt;&lt;/svg&gt;",
    );
    expect(modalHtml).not.toContain('href="javascript:alert(2)"');
  });
});
