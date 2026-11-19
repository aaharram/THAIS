import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { TaxeRequest, TaxeResponse } from './taxe-schemas';

interface ErrorResponse {
  message?: string;
}

interface TaxesState {
  item: TaxeResponse | null;
  allItems: TaxeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: TaxesState = {
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

export const getAllTaxes = createAsyncThunk<
  { items: TaxeResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('taxes/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: TaxeResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/taxes?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des taxes.');
  }
});

export const getTaxeById = createAsyncThunk<TaxeResponse, number, { rejectValue: string }>(
  'taxes/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<TaxeResponse>(`${API_BASE_URL}/api/taxes/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la taxe.');
    }
  },
);

export const createTaxe = createAsyncThunk<
  TaxeResponse,
  TaxeRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('taxes/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<TaxeResponse>(`${API_BASE_URL}/api/taxes`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Taxe créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la taxe.');
  }
});

export const editTaxe = createAsyncThunk<
  TaxeResponse,
  { id: number; updatedItem: TaxeRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('taxes/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<TaxeResponse>(`${API_BASE_URL}/api/taxes/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Taxe modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la taxe.');
  }
});

export const deleteTaxe = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'taxes/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/taxes/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Taxe supprimée avec succès.' }));
      dispatch(getAllTaxes({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la taxe.');
    }
  },
);

const taxesSlice = createSlice({
  name: 'taxes',
  initialState,
  reducers: {
    setTaxe: (state, action: PayloadAction<TaxeResponse>) => {
      state.item = action.payload;
    },
    resetTaxe: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTaxes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTaxes.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllTaxes.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des taxes.';
      })
      .addCase(getTaxeById.fulfilled, (state, action: PayloadAction<TaxeResponse>) => {
        state.item = action.payload;
      })
      .addCase(createTaxe.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la taxe.';
      })
      .addCase(editTaxe.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la taxe.';
      })
      .addCase(deleteTaxe.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la taxe.';
      });
  },
});

export const { setTaxe, resetTaxe } = taxesSlice.actions;
export default taxesSlice.reducer;
