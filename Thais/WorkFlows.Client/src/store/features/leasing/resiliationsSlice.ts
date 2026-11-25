import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ResiliationRequest, ResiliationResponse } from './resiliation-schemas';

const DATE_FIELDS: (keyof ResiliationRequest)[] = ['dateResiliation', 'dateReception', 'dateRestitutionActif'];
const sanitizeResiliationPayload = (payload: ResiliationRequest): ResiliationRequest =>
  nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface ResiliationsState {
  item: ResiliationResponse | null;
  allItems: ResiliationResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: ResiliationsState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
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

export const getAllResiliations = createAsyncThunk<
  { items: ResiliationResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('resiliations/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: ResiliationResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/resiliations?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des résiliations.');
  }
});

export const getResiliationById = createAsyncThunk<ResiliationResponse, number, { rejectValue: string }>(
  'resiliations/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ResiliationResponse>(`${API_BASE_URL}/api/resiliations/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la résiliation.');
    }
  },
);

export const createResiliation = createAsyncThunk<
  ResiliationResponse,
  ResiliationRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('resiliations/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ResiliationResponse>(`${API_BASE_URL}/api/resiliations`, sanitizeResiliationPayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Résiliation créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la résiliation.');
  }
});

export const editResiliation = createAsyncThunk<
  ResiliationResponse,
  { id: number; updatedItem: ResiliationRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('resiliations/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ResiliationResponse>(`${API_BASE_URL}/api/resiliations/${id}`, sanitizeResiliationPayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Résiliation modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la résiliation.');
  }
});

export const deleteResiliation = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'resiliations/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/resiliations/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Résiliation supprimée avec succès.' }));
      dispatch(getAllResiliations({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la résiliation.');
    }
  },
);

const resiliationsSlice = createSlice({
  name: 'resiliations',
  initialState,
  reducers: {
    setResiliation: (state, action: PayloadAction<ResiliationResponse>) => {
      state.item = action.payload;
    },
    resetResiliation: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllResiliations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllResiliations.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllResiliations.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des résiliations.';
      })
      .addCase(getResiliationById.fulfilled, (state, action: PayloadAction<ResiliationResponse>) => {
        state.item = action.payload;
      })
      .addCase(createResiliation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la résiliation.';
      })
      .addCase(editResiliation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la résiliation.';
      })
      .addCase(deleteResiliation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la résiliation.';
      });
  },
});

export const { setResiliation, resetResiliation } = resiliationsSlice.actions;
export default resiliationsSlice.reducer;
