import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { FilialeRequest, FilialeResponse } from './filiale-schemas';

interface ErrorResponse {
  message?: string;
}

interface FilialesState {
  item: FilialeResponse | null;
  allItems: FilialeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: FilialesState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllFiliales = createAsyncThunk<
  { items: FilialeResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('filiales/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);

    const { data } = await api.get<{
      items: FilialeResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/filiales?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des filiales.');
  }
});

export const getFilialeById = createAsyncThunk<FilialeResponse, number, { rejectValue: string }>(
  'filiales/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<FilialeResponse>(`${API_BASE_URL}/api/filiales/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de la filiale.");
    }
  },
);

export const createFiliale = createAsyncThunk<
  FilialeResponse,
  FilialeRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('filiales/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<FilialeResponse>(`${API_BASE_URL}/api/filiales`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Filiale créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de la filiale.");
  }
});

export const editFiliale = createAsyncThunk<
  FilialeResponse,
  { id: number; updatedItem: FilialeRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('filiales/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<FilialeResponse>(`${API_BASE_URL}/api/filiales/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Filiale modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de la filiale.");
  }
});

export const deleteFiliale = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'filiales/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/filiales/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Filiale supprimée avec succès.' }));
      dispatch(getAllFiliales({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de la filiale.");
    }
  },
);

const filialesSlice = createSlice({
  name: 'filiales',
  initialState,
  reducers: {
    setFiliale: (state, action: PayloadAction<FilialeResponse>) => {
      state.item = action.payload;
    },
    resetFiliale: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllFiliales.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllFiliales.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllFiliales.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des filiales.';
      })
      .addCase(getFilialeById.fulfilled, (state, action: PayloadAction<FilialeResponse>) => {
        state.item = action.payload;
      })
      .addCase(createFiliale.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de la filiale.";
      })
      .addCase(editFiliale.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de la filiale.";
      })
      .addCase(deleteFiliale.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de la filiale.";
      });
  },
});

export const { setFiliale, resetFiliale } = filialesSlice.actions;
export default filialesSlice.reducer;
