import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { NouveauBailResponse } from './nouveau-bail-schemas';

interface ErrorResponse {
  message?: string;
}

interface NouveauxBauxState {
  allItems: NouveauBailResponse[];
  error: string | null;
  loading: boolean;
}

const initialState: NouveauxBauxState = {
  allItems: [],
  error: null,
  loading: false,
};

export const getNouveauxBaux = createAsyncThunk<
  NouveauBailResponse[],
  { noProprietaire?: number },
  { rejectValue: string }
>('nouveauxBaux/getAll', async ({ noProprietaire }, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (noProprietaire) urlParams.append('noProprietaire', String(noProprietaire));

    const { data } = await api.get<NouveauBailResponse[]>(`${API_BASE_URL}/api/baux/nouveaux?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des nouveaux baux.');
  }
});

const nouveauxBauxSlice = createSlice({
  name: 'nouveauxBaux',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNouveauxBaux.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNouveauxBaux.fulfilled, (state, action: PayloadAction<NouveauBailResponse[]>) => {
        state.loading = false;
        state.allItems = action.payload;
      })
      .addCase(getNouveauxBaux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des nouveaux baux.';
      });
  },
});

export default nouveauxBauxSlice.reducer;
