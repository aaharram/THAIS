import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { VncRequest, VncResponse, VncSummary } from './vnc-schemas';

interface ErrorResponse {
  message?: string;
}

interface VncState {
  item: VncResponse | null;
  allItems: VncSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  versions: VncResponse[];
  versionsTotalCount: number;
  error: string | null;
  loading: boolean;
}

const initialState: VncState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  versions: [],
  versionsTotalCount: 0,
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

export const getVncSummary = createAsyncThunk<
  { items: VncSummary[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('vnc/getSummary', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: VncSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/vnc/summary?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des VNC.');
  }
});

export const getAllVnc = createAsyncThunk<
  { items: VncResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('vnc/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: VncResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/vnc?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des VNC.');
  }
});

export const getVncById = createAsyncThunk<VncResponse, number, { rejectValue: string }>(
  'vnc/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<VncResponse>(`${API_BASE_URL}/api/vnc/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la VNC.');
    }
  },
);

export const createVnc = createAsyncThunk<
  VncResponse,
  VncRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('vnc/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<VncResponse>(`${API_BASE_URL}/api/vnc`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'VNC créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la VNC.');
  }
});

export const editVnc = createAsyncThunk<
  VncResponse,
  { id: number; updatedItem: VncRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('vnc/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<VncResponse>(`${API_BASE_URL}/api/vnc/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'VNC modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la VNC.');
  }
});

export const deleteVnc = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'vnc/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/vnc/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'VNC supprimée avec succès.' }));
      dispatch(getVncSummary({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la VNC.');
    }
  },
);

const vncSlice = createSlice({
  name: 'vnc',
  initialState,
  reducers: {
    resetVnc: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVncSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVncSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getVncSummary.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des VNC.';
      })
      .addCase(getAllVnc.fulfilled, (state, action) => {
        state.versions = action.payload.items;
        state.versionsTotalCount = action.payload.totalCount;
      })
      .addCase(getVncById.fulfilled, (state, action: PayloadAction<VncResponse>) => {
        state.item = action.payload;
      })
      .addCase(createVnc.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la VNC.';
      })
      .addCase(editVnc.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la VNC.';
      })
      .addCase(deleteVnc.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la VNC.';
      });
  },
});

export const { resetVnc } = vncSlice.actions;
export default vncSlice.reducer;
