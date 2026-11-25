import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { PrestataireRequest, PrestataireResponse } from './prestataire-schemas';

interface ErrorResponse {
  message?: string;
}

interface PrestatairesState {
  item: PrestataireResponse | null;
  allItems: PrestataireResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: PrestatairesState = {
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

export const getAllPrestataires = createAsyncThunk<
  { items: PrestataireResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('prestataires/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: PrestataireResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/prestataires?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des prestataires.');
  }
});

export const getPrestataireById = createAsyncThunk<PrestataireResponse, number, { rejectValue: string }>(
  'prestataires/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PrestataireResponse>(`${API_BASE_URL}/api/prestataires/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du prestataire.');
    }
  },
);

export const createPrestataire = createAsyncThunk<
  PrestataireResponse,
  PrestataireRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('prestataires/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PrestataireResponse>(`${API_BASE_URL}/api/prestataires`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Prestataire créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du prestataire.');
  }
});

export const editPrestataire = createAsyncThunk<
  PrestataireResponse,
  { id: number; updatedItem: PrestataireRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('prestataires/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<PrestataireResponse>(`${API_BASE_URL}/api/prestataires/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Prestataire modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du prestataire.');
  }
});

export const deletePrestataire = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'prestataires/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/prestataires/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Prestataire supprimé avec succès.' }));
      dispatch(getAllPrestataires({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du prestataire.');
    }
  },
);

const prestatairesSlice = createSlice({
  name: 'prestataires',
  initialState,
  reducers: {
    setPrestataire: (state, action: PayloadAction<PrestataireResponse>) => {
      state.item = action.payload;
    },
    resetPrestataire: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPrestataires.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPrestataires.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllPrestataires.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des prestataires.';
      })
      .addCase(getPrestataireById.fulfilled, (state, action: PayloadAction<PrestataireResponse>) => {
        state.item = action.payload;
      })
      .addCase(createPrestataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du prestataire.';
      })
      .addCase(editPrestataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du prestataire.';
      })
      .addCase(deletePrestataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du prestataire.';
      });
  },
});

export const { setPrestataire, resetPrestataire } = prestatairesSlice.actions;
export default prestatairesSlice.reducer;
