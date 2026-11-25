import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { SyndicRequest, SyndicResponse } from './syndic-schemas';

const DATE_FIELDS: (keyof SyndicRequest)[] = ['debutMandat', 'finMandat'];
const sanitizePayload = (payload: SyndicRequest): SyndicRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface SyndicsState {
  item: SyndicResponse | null;
  allItems: SyndicResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: SyndicsState = {
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

export const getAllSyndics = createAsyncThunk<
  { items: SyndicResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('syndics/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: SyndicResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/syndics?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des syndics.');
  }
});

export const getSyndicById = createAsyncThunk<SyndicResponse, number, { rejectValue: string }>(
  'syndics/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<SyndicResponse>(`${API_BASE_URL}/api/syndics/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du syndic.');
    }
  },
);

export const createSyndic = createAsyncThunk<
  SyndicResponse,
  SyndicRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('syndics/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<SyndicResponse>(`${API_BASE_URL}/api/syndics`, sanitizePayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Syndic créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du syndic.');
  }
});

export const editSyndic = createAsyncThunk<
  SyndicResponse,
  { id: number; updatedItem: SyndicRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('syndics/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<SyndicResponse>(`${API_BASE_URL}/api/syndics/${id}`, sanitizePayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Syndic modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du syndic.');
  }
});

export const deleteSyndic = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'syndics/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/syndics/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Syndic supprimé avec succès.' }));
      dispatch(getAllSyndics({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du syndic.');
    }
  },
);

const syndicsSlice = createSlice({
  name: 'syndics',
  initialState,
  reducers: {
    setSyndic: (state, action: PayloadAction<SyndicResponse>) => {
      state.item = action.payload;
    },
    resetSyndic: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSyndics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSyndics.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllSyndics.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des syndics.';
      })
      .addCase(getSyndicById.fulfilled, (state, action: PayloadAction<SyndicResponse>) => {
        state.item = action.payload;
      })
      .addCase(createSyndic.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du syndic.';
      })
      .addCase(editSyndic.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du syndic.';
      })
      .addCase(deleteSyndic.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du syndic.';
      });
  },
});

export const { setSyndic, resetSyndic } = syndicsSlice.actions;
export default syndicsSlice.reducer;
