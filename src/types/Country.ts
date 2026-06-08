// Contrato para la UI (Limpio)
export interface Country {
  name: string;
  flag: string;
  population: number;
  region: string;
  capital: string;
  cca3: string;
  isFavorite: boolean;
}

// Contrato para la API (Estructura cruda de REST Countries)
export interface RestCountryAPIResponse {
  name: {
    common: string;
    official?: string;
  };
  flags: {
    png: string;
    svg: string;
  };
  population: number;
  region: string;
  capital?: string[];
  cca3: string;
}
