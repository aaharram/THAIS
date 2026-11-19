import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { SuiviImpayeLigneResponse } from './suivi-impaye-schemas';

interface ErrorResponse {
  message?: string;
}

interface SuiviImpayeState {
  allItems: SuiviImpayeLigneResponse[];
  error: string | null;
  loading: boolean;
}

const initialState: SuiviImpayeState = {
  allItems: [],
  error: null,
  loading: false,
};

export const getSuiviImpaye = createAsyncThunk<
  SuiviImpayeLigneResponse[],
  { noProprietaire?: number; noEncaisseur?: number },
  { rejectValue: string }
>('suiviImpaye/getAll', async ({ noProprietaire, noEncaisseur }, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (noProprietaire) urlParams.append('noProprietaire', String(noProprietaire));
    if (noEncaisseur) urlParams.append('noEncaisseur', String(noEncaisseur));

    const { data } = await api.get<SuiviImpayeLigneResponse[]>(
      `${API_BASE_URL}/api/etat-loyers/suivi-impaye?${urlParams.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du suivi des impayés.');
  }
});

const suiviImpayeSlice = createSlice({
  name: 'suiviImpaye',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSuiviImpaye.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSuiviImpaye.fulfilled, (state, action: PayloadAction<SuiviImpayeLigneResponse[]>) => {
        state.loading = false;
        state.allItems = action.payload;
      })
      .addCase(getSuiviImpaye.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du suivi des impayés.';
      });
  },
});

export default suiviImpayeSlice.reducer;
