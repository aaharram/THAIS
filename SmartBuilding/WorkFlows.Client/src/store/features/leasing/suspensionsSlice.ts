import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { SuspensionRequest, SuspensionResponse } from './suspension-schemas';

const DATE_FIELDS: (keyof SuspensionRequest)[] = ['dateSuspension', 'dateArretSuspension'];
const sanitizeSuspensionPayload = (payload: SuspensionRequest): SuspensionRequest =>
  nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface SuspensionsState {
  item: SuspensionResponse | null;
  allItems: SuspensionResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: SuspensionsState = {
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

export const getAllSuspensions = createAsyncThunk<
  { items: SuspensionResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('suspensions/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: SuspensionResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/suspensions?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des suspensions.');
  }
});

export const getSuspensionById = createAsyncThunk<SuspensionResponse, number, { rejectValue: string }>(
  'suspensions/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<SuspensionResponse>(`${API_BASE_URL}/api/suspensions/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la suspension.');
    }
  },
);

export const createSuspension = createAsyncThunk<
  SuspensionResponse,
  SuspensionRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('suspensions/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<SuspensionResponse>(`${API_BASE_URL}/api/suspensions`, sanitizeSuspensionPayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Suspension créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la suspension.');
  }
});

export const editSuspension = createAsyncThunk<
  SuspensionResponse,
  { id: number; updatedItem: SuspensionRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('suspensions/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<SuspensionResponse>(`${API_BASE_URL}/api/suspensions/${id}`, sanitizeSuspensionPayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Suspension modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la suspension.');
  }
});

export const deleteSuspension = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'suspensions/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/suspensions/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Suspension supprimée avec succès.' }));
      dispatch(getAllSuspensions({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la suspension.');
    }
  },
);

const suspensionsSlice = createSlice({
  name: 'suspensions',
  initialState,
  reducers: {
    setSuspension: (state, action: PayloadAction<SuspensionResponse>) => {
      state.item = action.payload;
    },
    resetSuspension: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSuspensions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSuspensions.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllSuspensions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des suspensions.';
      })
      .addCase(getSuspensionById.fulfilled, (state, action: PayloadAction<SuspensionResponse>) => {
        state.item = action.payload;
      })
      .addCase(createSuspension.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la suspension.';
      })
      .addCase(editSuspension.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la suspension.';
      })
      .addCase(deleteSuspension.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la suspension.';
      });
  },
});

export const { setSuspension, resetSuspension } = suspensionsSlice.actions;
export default suspensionsSlice.reducer;
