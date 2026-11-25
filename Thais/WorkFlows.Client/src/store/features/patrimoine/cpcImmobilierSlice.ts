import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { CpcImmobilierRequest, CpcImmobilierResponse } from './cpc-immobilier-schemas';

interface ErrorResponse {
  message?: string;
}

interface CpcImmobilierState {
  item: CpcImmobilierResponse | null;
  allItems: CpcImmobilierResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: CpcImmobilierState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllCpcImmobilier = createAsyncThunk<
  { items: CpcImmobilierResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('cpcImmobilier/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);

    const { data } = await api.get<{
      items: CpcImmobilierResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/cpc-immobilier?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des CPC.');
  }
});

export const getCpcImmobilierById = createAsyncThunk<CpcImmobilierResponse, number, { rejectValue: string }>(
  'cpcImmobilier/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<CpcImmobilierResponse>(`${API_BASE_URL}/api/cpc-immobilier/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du CPC.');
    }
  },
);

export const createCpcImmobilier = createAsyncThunk<
  CpcImmobilierResponse,
  CpcImmobilierRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('cpcImmobilier/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<CpcImmobilierResponse>(`${API_BASE_URL}/api/cpc-immobilier`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'CPC créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du CPC.');
  }
});

export const editCpcImmobilier = createAsyncThunk<
  CpcImmobilierResponse,
  { id: number; updatedItem: CpcImmobilierRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('cpcImmobilier/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<CpcImmobilierResponse>(`${API_BASE_URL}/api/cpc-immobilier/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'CPC modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du CPC.');
  }
});

export const deleteCpcImmobilier = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'cpcImmobilier/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/cpc-immobilier/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'CPC supprimé avec succès.' }));
      dispatch(getAllCpcImmobilier({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du CPC.');
    }
  },
);

const cpcImmobilierSlice = createSlice({
  name: 'cpcImmobilier',
  initialState,
  reducers: {
    setCpcImmobilier: (state, action: PayloadAction<CpcImmobilierResponse>) => {
      state.item = action.payload;
    },
    resetCpcImmobilier: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCpcImmobilier.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCpcImmobilier.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllCpcImmobilier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des CPC.';
      })
      .addCase(getCpcImmobilierById.fulfilled, (state, action: PayloadAction<CpcImmobilierResponse>) => {
        state.item = action.payload;
      })
      .addCase(createCpcImmobilier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du CPC.';
      })
      .addCase(editCpcImmobilier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du CPC.';
      })
      .addCase(deleteCpcImmobilier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du CPC.';
      });
  },
});

export const { setCpcImmobilier, resetCpcImmobilier } = cpcImmobilierSlice.actions;
export default cpcImmobilierSlice.reducer;
