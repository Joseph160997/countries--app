export type Region = "Africa" | "Americas" | "Asia" | "Europe" | "Oceania" | "";

export interface Country {
  cca3: string;
  name: string;
  flag: string;
  flagAlt: string; // accesibilidad: siempre un string, nunca undefined
  population: number;
  region: Region;
  capital: string; // "No Capital" si no viene — nunca undefined
  isFavorite: boolean;
  subregion: string; // "" si no viene
  borders: string[]; // [] si no viene — nunca undefined
  languages: string[]; // [] si no viene
  currencies: string[]; // [] si no viene
  tld: string[]; // [] si no viene
}
