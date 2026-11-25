import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  ApercuEmissionsEncaissement,
  EtatImpayeResponse,
  PrimeEncaisseurResponse,
  RapportEncaisseurResponse,
  SuiviEncaissementResponse,
} from './rapports-recouvrement-schemas';

interface ErrorResponse {
  message?: string;
}

interface RapportsRecouvrementState {
  etatImpaye: EtatImpayeResponse | null;
  apercu: ApercuEmissionsEncaissement | null;
  suiviEncaissement: SuiviEncaissementResponse | null;
  rapportEncaisseur: RapportEncaisseurResponse | null;
  primeEncaisseur: PrimeEncaisseurResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: RapportsRecouvrementState = {
  etatImpaye: null,
  apercu: null,
  suiviEncaissement: null,
  rapportEncaisseur: null,
  primeEncaisseur: null,
  loading: false,
  error: null,
};

export const getEtatImpaye = createAsyncThunk<EtatImpayeResponse, void, { rejectValue: string }>(
  'rapportsRecouvrement/getEtatImpaye',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<EtatImpayeResponse>(`${API_BASE_URL}/api/rapports-recouvrement/etat-impaye`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'état impayé.");
    }
  },
);

export const getApercuEmissionsEncaissement = createAsyncThunk<
  ApercuEmissionsEncaissement,
  { annee: number; mois: number },
  { rejectValue: string }
>('rapportsRecouvrement/getApercu', async ({ annee, mois }, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ApercuEmissionsEncaissement>(
      `${API_BASE_URL}/api/rapports-recouvrement/apercu-emissions-encaissement?annee=${annee}&mois=${mois}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'aperçu.");
  }
});

export const getSuiviEncaissement = createAsyncThunk<
  SuiviEncaissementResponse,
  { annee: number; mois: number; noEncaisseur?: number; noBuilding?: number },
  { rejectValue: string }
>('rapportsRecouvrement/getSuiviEncaissement', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    params.append('annee', String(filters.annee));
    params.append('mois', String(filters.mois));
    if (filters.noEncaisseur) params.append('noEncaisseur', String(filters.noEncaisseur));
    if (filters.noBuilding) params.append('noBuilding', String(filters.noBuilding));
    const { data } = await api.get<SuiviEncaissementResponse>(
      `${API_BASE_URL}/api/rapports-recouvrement/suivi-encaissement?${params.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération du suivi d'encaissement.");
  }
});

export const getRapportEncaisseur = createAsyncThunk<
  RapportEncaisseurResponse,
  { annee: number; noEncaisseur?: number },
  { rejectValue: string }
>('rapportsRecouvrement/getRapportEncaisseur', async ({ annee, noEncaisseur }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    params.append('annee', String(annee));
    if (noEncaisseur) params.append('noEncaisseur', String(noEncaisseur));
    const { data } = await api.get<RapportEncaisseurResponse>(
      `${API_BASE_URL}/api/rapports-recouvrement/rapport-encaisseur?${params.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du rapport encaisseur.');
  }
});

export const getPrimeEncaisseur = createAsyncThunk<
  PrimeEncaisseurResponse,
  { annee: number; mois: number },
  { rejectValue: string }
>('rapportsRecouvrement/getPrimeEncaisseur', async ({ annee, mois }, { rejectWithValue }) => {
  try {
    const { data } = await api.get<PrimeEncaisseurResponse>(
      `${API_BASE_URL}/api/rapports-recouvrement/prime-encaisseur?annee=${annee}&mois=${mois}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la prime encaisseur.');
  }
});

const rapportsRecouvrementSlice = createSlice({
  name: 'rapportsRecouvrement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEtatImpaye.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEtatImpaye.fulfilled, (state, action: PayloadAction<EtatImpayeResponse>) => {
        state.loading = false;
        state.etatImpaye = action.payload;
      })
      .addCase(getEtatImpaye.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Échec de la récupération de l'état impayé.";
      })
      .addCase(getApercuEmissionsEncaissement.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getApercuEmissionsEncaissement.fulfilled,
        (state, action: PayloadAction<ApercuEmissionsEncaissement>) => {
          state.loading = false;
          state.apercu = action.payload;
        },
      )
      .addCase(getApercuEmissionsEncaissement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Échec de la récupération de l'aperçu.";
      })
      .addCase(getSuiviEncaissement.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSuiviEncaissement.fulfilled, (state, action: PayloadAction<SuiviEncaissementResponse>) => {
        state.loading = false;
        state.suiviEncaissement = action.payload;
      })
      .addCase(getSuiviEncaissement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Échec de la récupération du suivi d'encaissement.";
      })
      .addCase(getRapportEncaisseur.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRapportEncaisseur.fulfilled, (state, action: PayloadAction<RapportEncaisseurResponse>) => {
        state.loading = false;
        state.rapportEncaisseur = action.payload;
      })
      .addCase(getRapportEncaisseur.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du rapport encaisseur.';
      })
      .addCase(getPrimeEncaisseur.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPrimeEncaisseur.fulfilled, (state, action: PayloadAction<PrimeEncaisseurResponse>) => {
        state.loading = false;
        state.primeEncaisseur = action.payload;
      })
      .addCase(getPrimeEncaisseur.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération de la prime encaisseur.';
      });
  },
});

export default rapportsRecouvrementSlice.reducer;
