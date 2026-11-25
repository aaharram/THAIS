import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  ContentieuxHorsLocationRequest,
  ContentieuxHorsLocationResponse,
} from './contentieux-hors-location-schemas';

interface ErrorResponse {
  message?: string;
}

interface ContentieuxHorsLocationState {
  item: ContentieuxHorsLocationResponse | null;
  allItems: ContentieuxHorsLocationResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: ContentieuxHorsLocationState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllContentieuxHorsLocation = createAsyncThunk<
  { items: ContentieuxHorsLocationResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('contentieuxHorsLocation/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);

    const { data } = await api.get<{
      items: ContentieuxHorsLocationResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/contentieux-hors-location?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des dossiers.');
  }
});

export const getContentieuxHorsLocationById = createAsyncThunk<
  ContentieuxHorsLocationResponse,
  number,
  { rejectValue: string }
>('contentieuxHorsLocation/getById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ContentieuxHorsLocationResponse>(
      `${API_BASE_URL}/api/contentieux-hors-location/${id}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du dossier.');
  }
});

export const createContentieuxHorsLocation = createAsyncThunk<
  ContentieuxHorsLocationResponse,
  ContentieuxHorsLocationRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('contentieuxHorsLocation/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ContentieuxHorsLocationResponse>(
      `${API_BASE_URL}/api/contentieux-hors-location`,
      payload,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Dossier créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du dossier.');
  }
});

export const editContentieuxHorsLocation = createAsyncThunk<
  ContentieuxHorsLocationResponse,
  { id: number; updatedItem: ContentieuxHorsLocationRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('contentieuxHorsLocation/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ContentieuxHorsLocationResponse>(
      `${API_BASE_URL}/api/contentieux-hors-location/${id}`,
      updatedItem,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Dossier modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du dossier.');
  }
});

export const deleteContentieuxHorsLocation = createAsyncThunk<
  void,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('contentieuxHorsLocation/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`${API_BASE_URL}/api/contentieux-hors-location/${id}`);
    dispatch(setToastOpen({ isOpen: true, message: 'Dossier supprimé avec succès.' }));
    dispatch(getAllContentieuxHorsLocation({}));
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du dossier.');
  }
});

const contentieuxHorsLocationSlice = createSlice({
  name: 'contentieuxHorsLocation',
  initialState,
  reducers: {
    setContentieuxHorsLocation: (state, action: PayloadAction<ContentieuxHorsLocationResponse>) => {
      state.item = action.payload;
    },
    resetContentieuxHorsLocation: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllContentieuxHorsLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllContentieuxHorsLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllContentieuxHorsLocation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des dossiers.';
      })
      .addCase(getContentieuxHorsLocationById.fulfilled, (state, action: PayloadAction<ContentieuxHorsLocationResponse>) => {
        state.item = action.payload;
      })
      .addCase(createContentieuxHorsLocation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du dossier.';
      })
      .addCase(editContentieuxHorsLocation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du dossier.';
      })
      .addCase(deleteContentieuxHorsLocation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du dossier.';
      });
  },
});

export const { setContentieuxHorsLocation, resetContentieuxHorsLocation } = contentieuxHorsLocationSlice.actions;
export default contentieuxHorsLocationSlice.reducer;
