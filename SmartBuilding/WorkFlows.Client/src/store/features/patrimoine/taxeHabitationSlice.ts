import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { TaxeHabitationBuilding } from './taxe-habitation-schemas';

interface ErrorResponse {
  message?: string;
}

interface TaxeHabitationState {
  buildings: TaxeHabitationBuilding[];
  error: string | null;
  loading: boolean;
}

const initialState: TaxeHabitationState = {
  buildings: [],
  error: null,
  loading: false,
};

export const getTaxeHabitation = createAsyncThunk<
  TaxeHabitationBuilding[],
  { noProprietaire?: number; noBuilding?: number },
  { rejectValue: string }
>('taxeHabitation/get', async ({ noProprietaire, noBuilding }, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (noProprietaire) urlParams.append('noProprietaire', String(noProprietaire));
    if (noBuilding) urlParams.append('noBuilding', String(noBuilding));

    const { data } = await api.get<TaxeHabitationBuilding[]>(
      `${API_BASE_URL}/api/taxe-habitation?${urlParams.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la taxe habitation.');
  }
});

const taxeHabitationSlice = createSlice({
  name: 'taxeHabitation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTaxeHabitation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTaxeHabitation.fulfilled, (state, action: PayloadAction<TaxeHabitationBuilding[]>) => {
        state.loading = false;
        state.buildings = action.payload;
      })
      .addCase(getTaxeHabitation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération de la taxe habitation.';
      });
  },
});

export default taxeHabitationSlice.reducer;
