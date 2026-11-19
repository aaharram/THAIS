import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { SyndicImmeubleSummary, SyndicReunionRequest, SyndicReunionResponse } from './syndic-reunion-schemas';

const DATE_FIELDS: (keyof SyndicReunionRequest)[] = ['dateReunion', 'dateReglement'];
const sanitizePayload = (payload: SyndicReunionRequest): SyndicReunionRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface SyndicReunionsState {
  item: SyndicReunionResponse | null;
  allItems: SyndicReunionResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
  summaryItems: SyndicImmeubleSummary[];
  summaryTotalCount: number;
  summaryPageNumber: number;
  summaryPageSize: number;
  summaryLoading: boolean;
}

const initialState: SyndicReunionsState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
  summaryItems: [],
  summaryTotalCount: 0,
  summaryPageNumber: 1,
  summaryPageSize: 10,
  summaryLoading: false,
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

export const getAllSyndicReunions = createAsyncThunk<
  { items: SyndicReunionResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('syndicReunions/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: SyndicReunionResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/syndic-reunions?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des réunions.');
  }
});

export const getSyndicSummaryByBuilding = createAsyncThunk<
  { items: SyndicImmeubleSummary[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('syndicReunions/getSummaryByBuilding', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: SyndicImmeubleSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/syndic-reunions/par-immeuble?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des immeubles.');
  }
});

export const getSyndicReunionById = createAsyncThunk<SyndicReunionResponse, number, { rejectValue: string }>(
  'syndicReunions/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<SyndicReunionResponse>(`${API_BASE_URL}/api/syndic-reunions/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la réunion.');
    }
  },
);

export const createSyndicReunion = createAsyncThunk<
  SyndicReunionResponse,
  SyndicReunionRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('syndicReunions/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<SyndicReunionResponse>(
      `${API_BASE_URL}/api/syndic-reunions`,
      sanitizePayload(payload),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Réunion créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la réunion.');
  }
});

export const editSyndicReunion = createAsyncThunk<
  SyndicReunionResponse,
  { id: number; updatedItem: SyndicReunionRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('syndicReunions/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<SyndicReunionResponse>(
      `${API_BASE_URL}/api/syndic-reunions/${id}`,
      sanitizePayload(updatedItem),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Réunion modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la réunion.');
  }
});

export const deleteSyndicReunion = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'syndicReunions/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/syndic-reunions/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Réunion supprimée avec succès.' }));
      dispatch(getAllSyndicReunions({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la réunion.');
    }
  },
);

const syndicReunionsSlice = createSlice({
  name: 'syndicReunions',
  initialState,
  reducers: {
    setSyndicReunion: (state, action: PayloadAction<SyndicReunionResponse>) => {
      state.item = action.payload;
    },
    resetSyndicReunion: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSyndicReunions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSyndicReunions.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllSyndicReunions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des réunions.';
      })
      .addCase(getSyndicReunionById.fulfilled, (state, action: PayloadAction<SyndicReunionResponse>) => {
        state.item = action.payload;
      })
      .addCase(getSyndicSummaryByBuilding.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(getSyndicSummaryByBuilding.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summaryItems = action.payload.items;
        state.summaryTotalCount = action.payload.totalCount;
        state.summaryPageNumber = action.payload.pageNumber;
        state.summaryPageSize = action.payload.pageSize;
      })
      .addCase(getSyndicSummaryByBuilding.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.summaryLoading = false;
        state.error = action.payload || 'Échec de la récupération des immeubles.';
      })
      .addCase(createSyndicReunion.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la réunion.';
      })
      .addCase(editSyndicReunion.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la réunion.';
      })
      .addCase(deleteSyndicReunion.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la réunion.';
      });
  },
});

export const { setSyndicReunion, resetSyndicReunion } = syndicReunionsSlice.actions;
export default syndicReunionsSlice.reducer;
