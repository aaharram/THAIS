import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { LocalVacantResponse } from './local-vacant-schemas';

interface ErrorResponse {
  message?: string;
}

interface LocauxVacantsState {
  allItems: LocalVacantResponse[];
  error: string | null;
  loading: boolean;
}

const initialState: LocauxVacantsState = {
  allItems: [],
  error: null,
  loading: false,
};

export const getLocauxVacants = createAsyncThunk<
  LocalVacantResponse[],
  { noProprietaire?: number },
  { rejectValue: string }
>('locauxVacants/getAll', async ({ noProprietaire }, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (noProprietaire) urlParams.append('noProprietaire', String(noProprietaire));

    const { data } = await api.get<LocalVacantResponse[]>(
      `${API_BASE_URL}/api/locaux/vacants?${urlParams.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des locaux vacants.');
  }
});

const locauxVacantsSlice = createSlice({
  name: 'locauxVacants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLocauxVacants.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLocauxVacants.fulfilled, (state, action: PayloadAction<LocalVacantResponse[]>) => {
        state.loading = false;
        state.allItems = action.payload;
      })
      .addCase(getLocauxVacants.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des locaux vacants.';
      });
  },
});

export default locauxVacantsSlice.reducer;
