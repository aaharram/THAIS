export interface LookupResponse {
  numero: number;
  designation: string;
  taux?: number | null;
  accesComplet?: boolean | null;
  addUser?: number | null;
  addDate: string;
  modUser?: number | null;
  modDate: string;
}

export interface LookupRequest {
  addUser?: number | null;
  modUser?: number | null;
  designation: string;
  taux?: number | null;
  accesComplet?: boolean | null;
}
