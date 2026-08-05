/** Lo que la app necesita de Wikipedia — independiente de su API. */
export interface WikiSummary {
  readonly extract: string;
  readonly thumbnail: string | null;
  readonly pageUrl: string;
}
