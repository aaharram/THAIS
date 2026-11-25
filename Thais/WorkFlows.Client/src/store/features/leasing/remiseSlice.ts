import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { RemiseResponse } from './remise-schemas';

interface ErrorResponse {
  message?: string;
}

interface RemiseFilters {
  statut?: number;
  annee?: number;
  mois?: number;
}

interface RemiseState {
  allItems: RemiseResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  annees: number[];
  mois: number[];
  error: string | null;
  loading: boolean;
}

const initialState: RemiseState = {
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  annees: [],
  mois: [],
  error: null,
  loading: false,
};

const buildUrlParams = (params: IFetchParams & RemiseFilters) => {
  const urlParams = new URLSearchParams();
  urlParams.append('pageNumber', String(params.pageNumber || 1));
  urlParams.append('pageSize', String(params.pageSize || 10));
  if (params.search) urlParams.append('search', params.search);
  urlParams.append('statut', String(params.statut ?? 0));
  urlParams.append('annee', String(params.annee ?? 0));
  urlParams.append('mois', String(params.mois ?? 0));
  return urlParams;
};

export const getAllRemises = createAsyncThunk<
  { items: RemiseResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams & RemiseFilters,
  { rejectValue: string }
>('remise/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: RemiseResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/remises?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des remises.');
  }
});

export const getAnneesRemises = createAsyncThunk<number[], void, { rejectValue: string }>(
  'remise/getAnnees',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<number[]>(`${API_BASE_URL}/api/remises/annees`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des années.');
    }
  },
);

export const getMoisRemises = createAsyncThunk<number[], number, { rejectValue: string }>(
  'remise/getMois',
  async (annee, { rejectWithValue }) => {
    try {
      const { data } = await api.get<number[]>(`${API_BASE_URL}/api/remises/mois?annee=${annee}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des mois.');
    }
  },
);

export const annulerRemises = createAsyncThunk<void, number[], { dispatch: AppDispatch; rejectValue: string }>(
  'remise/annuler',
  async (ids, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`${API_BASE_URL}/api/remises/annuler`, { ids });
      dispatch(setToastOpen({ isOpen: true, message: 'Remise(s) annulée(s) avec succès.' }));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de l'annulation.");
    }
  },
);

export const supprimerRemises = createAsyncThunk<void, number[], { dispatch: AppDispatch; rejectValue: string }>(
  'remise/supprimer',
  async (ids, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`${API_BASE_URL}/api/remises/supprimer`, { ids });
      dispatch(setToastOpen({ isOpen: true, message: 'Remise(s) supprimée(s) avec succès.' }));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression.');
    }
  },
);

const remiseSlice = createSlice({
  name: 'remise',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllRemises.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllRemises.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllRemises.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des remises.';
      })
      .addCase(getAnneesRemises.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.annees = action.payload;
      })
      .addCase(getMoisRemises.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.mois = action.payload;
      })
      .addCase(annulerRemises.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'annulation.";
      })
      .addCase(supprimerRemises.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression.';
      });
  },
});

export default remiseSlice.reducer;
