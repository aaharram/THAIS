import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { DashboardActifResponse, DashboardFilters, DashboardResponse } from './dashboard-schemas';

interface ErrorResponse {
  message?: string;
}

interface DashboardState {
  item: DashboardResponse | null;
  actifs: DashboardActifResponse[];
  error: string | null;
  loading: boolean;
}

const initialState: DashboardState = {
  item: null,
  actifs: [],
  error: null,
  loading: false,
};

export const getDashboard = createAsyncThunk<DashboardResponse, DashboardFilters, { rejectValue: string }>(
  'dashboard/get',
  async (filters, { rejectWithValue }) => {
    try {
      const urlParams = new URLSearchParams();
      if (filters.noProprietaire) urlParams.append('noProprietaire', String(filters.noProprietaire));
      if (filters.noCity) urlParams.append('noCity', String(filters.noCity));
      if (filters.noLocalType) urlParams.append('noLocalType', String(filters.noLocalType));
      if (filters.noBuilding) urlParams.append('noBuilding', String(filters.noBuilding));

      const { data } = await api.get<DashboardResponse>(`${API_BASE_URL}/api/dashboard?${urlParams.toString()}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la récupération du tableau de bord.',
      );
    }
  },
);

// RMANew (DataEntryLeasing.vb, ListImmeubles) : la liste "Actifs" dépend des 3 autres
// filtres - rechargée à chaque changement de Propriétaire/Ville/Typologie.
export const getDashboardActifs = createAsyncThunk<
  DashboardActifResponse[],
  Omit<DashboardFilters, 'noBuilding'>,
  { rejectValue: string }
>('dashboard/getActifs', async (filters, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (filters.noProprietaire) urlParams.append('noProprietaire', String(filters.noProprietaire));
    if (filters.noCity) urlParams.append('noCity', String(filters.noCity));
    if (filters.noLocalType) urlParams.append('noLocalType', String(filters.noLocalType));

    const { data } = await api.get<DashboardActifResponse[]>(
      `${API_BASE_URL}/api/dashboard/actifs?${urlParams.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des actifs.');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(getDashboard.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du tableau de bord.';
      })
      .addCase(getDashboardActifs.fulfilled, (state, action: PayloadAction<DashboardActifResponse[]>) => {
        state.actifs = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
