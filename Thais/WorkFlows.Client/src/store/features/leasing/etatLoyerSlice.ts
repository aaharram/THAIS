import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { EtatLoyerResponse, PeriodeValidee } from './etat-loyer-schemas';
import { ImpayesParAgeResponse } from './impayes-par-age-schemas';

interface ErrorResponse {
  message?: string;
}

interface EtatLoyerFilters {
  annee: number;
  mois: number;
  noBuilding?: number;
  noProprietaire?: number;
}

interface EtatLoyerState {
  etat: EtatLoyerResponse | null;
  historique: EtatLoyerResponse | null;
  periodesValidees: PeriodeValidee[];
  impayesParAge: ImpayesParAgeResponse | null;
  loading: boolean;
  validating: boolean;
  error: string | null;
}

const initialState: EtatLoyerState = {
  etat: null,
  historique: null,
  periodesValidees: [],
  impayesParAge: null,
  loading: false,
  validating: false,
  error: null,
};

const buildQuery = (filters: EtatLoyerFilters) => {
  const params = new URLSearchParams();
  params.append('annee', String(filters.annee));
  params.append('mois', String(filters.mois));
  if (filters.noBuilding) params.append('noBuilding', String(filters.noBuilding));
  if (filters.noProprietaire) params.append('noProprietaire', String(filters.noProprietaire));
  return params.toString();
};

export const getEtatLoyer = createAsyncThunk<EtatLoyerResponse, EtatLoyerFilters, { rejectValue: string }>(
  'etatLoyer/get',
  async (filters, { rejectWithValue }) => {
    try {
      const { data } = await api.get<EtatLoyerResponse>(`${API_BASE_URL}/api/etat-loyers?${buildQuery(filters)}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'état des loyers.");
    }
  },
);

export const getHistoriqueEtatLoyer = createAsyncThunk<
  EtatLoyerResponse,
  EtatLoyerFilters,
  { rejectValue: string }
>('etatLoyer/getHistorique', async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get<EtatLoyerResponse>(
      `${API_BASE_URL}/api/etat-loyers/historique?${buildQuery(filters)}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'historique.");
  }
});

export const getPeriodesValidees = createAsyncThunk<PeriodeValidee[], void, { rejectValue: string }>(
  'etatLoyer/getPeriodesValidees',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PeriodeValidee[]>(`${API_BASE_URL}/api/etat-loyers/periodes-validees`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des périodes validées.');
    }
  },
);

export const validerEtatLoyer = createAsyncThunk<
  EtatLoyerResponse,
  { annee: number; mois: number; validePar: number },
  { dispatch: AppDispatch; rejectValue: string }
>('etatLoyer/valider', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<EtatLoyerResponse>(`${API_BASE_URL}/api/etat-loyers/valider`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'État des loyers validé avec succès.' }));
    dispatch(getPeriodesValidees());
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la validation de l'état des loyers.");
  }
});

export const getImpayesParAge = createAsyncThunk<
  ImpayesParAgeResponse,
  { noProprietaire?: number },
  { rejectValue: string }
>('etatLoyer/getImpayesParAge', async ({ noProprietaire }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (noProprietaire) params.append('noProprietaire', String(noProprietaire));
    const { data } = await api.get<ImpayesParAgeResponse>(
      `${API_BASE_URL}/api/etat-loyers/impayes-par-age?${params.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des impayés par âge.');
  }
});

const etatLoyerSlice = createSlice({
  name: 'etatLoyer',
  initialState,
  reducers: {
    resetEtatLoyer: (state) => {
      state.etat = null;
      state.historique = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEtatLoyer.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEtatLoyer.fulfilled, (state, action: PayloadAction<EtatLoyerResponse>) => {
        state.loading = false;
        state.etat = action.payload;
      })
      .addCase(getEtatLoyer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Échec de la récupération de l'état des loyers.";
      })
      .addCase(getHistoriqueEtatLoyer.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHistoriqueEtatLoyer.fulfilled, (state, action: PayloadAction<EtatLoyerResponse>) => {
        state.loading = false;
        state.historique = action.payload;
      })
      .addCase(getHistoriqueEtatLoyer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Échec de la récupération de l'historique.";
      })
      .addCase(getPeriodesValidees.fulfilled, (state, action: PayloadAction<PeriodeValidee[]>) => {
        state.periodesValidees = action.payload;
      })
      .addCase(validerEtatLoyer.pending, (state) => {
        state.validating = true;
      })
      .addCase(validerEtatLoyer.fulfilled, (state, action: PayloadAction<EtatLoyerResponse>) => {
        state.validating = false;
        state.etat = action.payload;
      })
      .addCase(validerEtatLoyer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.validating = false;
        state.error = action.payload || "Échec de la validation de l'état des loyers.";
      })
      .addCase(getImpayesParAge.pending, (state) => {
        state.loading = true;
      })
      .addCase(getImpayesParAge.fulfilled, (state, action: PayloadAction<ImpayesParAgeResponse>) => {
        state.loading = false;
        state.impayesParAge = action.payload;
      })
      .addCase(getImpayesParAge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des impayés par âge.';
      });
  },
});

export const { resetEtatLoyer } = etatLoyerSlice.actions;
export default etatLoyerSlice.reducer;
