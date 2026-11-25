import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { PrestationAchatRequest, PrestationAchatResponse } from './prestation-achat-schemas';

interface ErrorResponse {
  message?: string;
}

interface PrestationsAchatState {
  item: PrestationAchatResponse | null;
  allItems: PrestationAchatResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: PrestationsAchatState = {
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

export const getAllPrestationsAchat = createAsyncThunk<
  { items: PrestationAchatResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('prestationsAchat/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: PrestationAchatResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/prestations-achat?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des prestations.');
  }
});

export const getPrestationAchatById = createAsyncThunk<PrestationAchatResponse, number, { rejectValue: string }>(
  'prestationsAchat/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PrestationAchatResponse>(`${API_BASE_URL}/api/prestations-achat/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la prestation.');
    }
  },
);

export const createPrestationAchat = createAsyncThunk<
  PrestationAchatResponse,
  PrestationAchatRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('prestationsAchat/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PrestationAchatResponse>(`${API_BASE_URL}/api/prestations-achat`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Prestation créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la prestation.');
  }
});

export const editPrestationAchat = createAsyncThunk<
  PrestationAchatResponse,
  { id: number; updatedItem: PrestationAchatRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('prestationsAchat/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<PrestationAchatResponse>(`${API_BASE_URL}/api/prestations-achat/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Prestation modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la prestation.');
  }
});

export const amortirPrestationAchat = createAsyncThunk<
  PrestationAchatResponse,
  { id: number; dureeMois: number; taux?: number | null },
  { dispatch: AppDispatch; rejectValue: string }
>('prestationsAchat/amortir', async ({ id, dureeMois, taux }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PrestationAchatResponse>(`${API_BASE_URL}/api/prestations-achat/${id}/amortir`, {
      dureeMois,
      taux,
    });
    dispatch(setToastOpen({ isOpen: true, message: 'Prestation amortie avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const message = axiosError.response?.data?.message || "Échec de l'amortissement de la prestation.";
    dispatch(setToastOpen({ isOpen: true, error: message }));
    return rejectWithValue(message);
  }
});

export const deletePrestationAchat = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'prestationsAchat/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/prestations-achat/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Prestation supprimée avec succès.' }));
      dispatch(getAllPrestationsAchat({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la prestation.');
    }
  },
);

const prestationsAchatSlice = createSlice({
  name: 'prestationsAchat',
  initialState,
  reducers: {
    setPrestationAchat: (state, action: PayloadAction<PrestationAchatResponse>) => {
      state.item = action.payload;
    },
    resetPrestationAchat: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPrestationsAchat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPrestationsAchat.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllPrestationsAchat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des prestations.';
      })
      .addCase(getPrestationAchatById.fulfilled, (state, action: PayloadAction<PrestationAchatResponse>) => {
        state.item = action.payload;
      })
      .addCase(createPrestationAchat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la prestation.';
      })
      .addCase(editPrestationAchat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la prestation.';
      })
      .addCase(amortirPrestationAchat.fulfilled, (state, action: PayloadAction<PrestationAchatResponse>) => {
        const idx = state.allItems.findIndex((p) => p.numero === action.payload.numero);
        if (idx !== -1) state.allItems[idx] = action.payload;
      })
      .addCase(amortirPrestationAchat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'amortissement de la prestation.";
      })
      .addCase(deletePrestationAchat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la prestation.';
      });
  },
});

export const { setPrestationAchat, resetPrestationAchat } = prestationsAchatSlice.actions;
export default prestationsAchatSlice.reducer;
