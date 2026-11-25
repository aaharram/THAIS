import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { RelanceRequest, RelanceResponse, RelanceSummary } from './relance-schemas';

interface ErrorResponse {
  message?: string;
}

interface RelancesState {
  allItems: RelanceSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  historique: RelanceResponse[];
  historiqueTotalCount: number;
  error: string | null;
  loading: boolean;
}

const initialState: RelancesState = {
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  historique: [],
  historiqueTotalCount: 0,
  error: null,
  loading: false,
};

const buildUrlParams = (params: IFetchParams) => {
  const urlParams = new URLSearchParams();
  urlParams.append('pageNumber', String(params.pageNumber || 1));
  urlParams.append('pageSize', String(params.pageSize || 10));
  if (params.search) urlParams.append('search', params.search);
  if (params.filters) {
    Object.entries(params.filters).forEach(([field, values], i) => {
      urlParams.append(`Filters[${i}].Field`, field);
      values.forEach((value, j) => urlParams.append(`Filters[${i}].Values[${j}]`, String(value)));
    });
  }
  return urlParams;
};

export const getRelancesSummary = createAsyncThunk<
  { items: RelanceSummary[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('relances/getSummary', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: RelanceSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/relances/summary?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du recouvrement.');
  }
});

export const getRelancesHistorique = createAsyncThunk<
  { items: RelanceResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('relances/getHistorique', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: RelanceResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/relances?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'historique.");
  }
});

export const creerRelance = createAsyncThunk<
  RelanceResponse,
  RelanceRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('relances/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<RelanceResponse>(`${API_BASE_URL}/api/relances`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Relance enregistrée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'enregistrement de la relance.");
  }
});

const relancesSlice = createSlice({
  name: 'relances',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRelancesSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRelancesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getRelancesSummary.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du recouvrement.';
      })
      .addCase(getRelancesHistorique.fulfilled, (state, action) => {
        state.historique = action.payload.items;
        state.historiqueTotalCount = action.payload.totalCount;
      })
      .addCase(creerRelance.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'enregistrement de la relance.";
      });
  },
});

export default relancesSlice.reducer;
