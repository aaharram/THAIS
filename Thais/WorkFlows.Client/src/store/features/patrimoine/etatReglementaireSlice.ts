import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { EtatReglementaireResponse } from './etat-reglementaire-schemas';

interface ErrorResponse {
  message?: string;
}

interface EtatReglementaireState {
  etat: EtatReglementaireResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: EtatReglementaireState = {
  etat: null,
  loading: false,
  error: null,
};

export const getD21 = createAsyncThunk<EtatReglementaireResponse, void, { rejectValue: string }>(
  'etatReglementaire/getD21',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<EtatReglementaireResponse>(`${API_BASE_URL}/api/etats-reglementaires/d21`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du D21.');
    }
  },
);

export const getD05 = createAsyncThunk<EtatReglementaireResponse, void, { rejectValue: string }>(
  'etatReglementaire/getD05',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<EtatReglementaireResponse>(`${API_BASE_URL}/api/etats-reglementaires/d05`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du D05.');
    }
  },
);

const etatReglementaireSlice = createSlice({
  name: 'etatReglementaire',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getD21.pending, (state) => {
        state.loading = true;
      })
      .addCase(getD21.fulfilled, (state, action: PayloadAction<EtatReglementaireResponse>) => {
        state.loading = false;
        state.etat = action.payload;
      })
      .addCase(getD21.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du D21.';
      })
      .addCase(getD05.pending, (state) => {
        state.loading = true;
      })
      .addCase(getD05.fulfilled, (state, action: PayloadAction<EtatReglementaireResponse>) => {
        state.loading = false;
        state.etat = action.payload;
      })
      .addCase(getD05.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du D05.';
      });
  },
});

export default etatReglementaireSlice.reducer;
