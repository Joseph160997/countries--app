/** Respuesta cruda del endpoint REST /page/summary de Wikipedia. */
export interface WikipediaSummaryResponse {
  readonly title: string;
  readonly extract: string;
  readonly thumbnail?: { readonly source: string };
  readonly content_urls?: {
    readonly desktop?: { readonly page?: string };
  };
}
