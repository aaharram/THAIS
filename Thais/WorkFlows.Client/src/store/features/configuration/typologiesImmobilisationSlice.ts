import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { TypologieImmobilisationRequest, TypologieImmobilisationResponse } from './typologieImmobilisation-schemas';

interface ErrorResponse {
  message?: string;
}

interface TypologiesImmobilisationState {
  item: TypologieImmobilisationResponse | null;
  allItems: TypologieImmobilisationResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: TypologiesImmobilisationState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllTypologiesImmobilisation = createAsyncThunk<
  { items: TypologieImmobilisationResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('typologiesImmobilisation/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);

    const { data } = await api.get<{
      items: TypologieImmobilisationResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/typologies-immobilisation?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la récupération des typologies d’immobilisation.',
    );
  }
});

export const getTypologieImmobilisationById = createAsyncThunk<
  TypologieImmobilisationResponse,
  number,
  { rejectValue: string }
>('typologiesImmobilisation/getById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<TypologieImmobilisationResponse>(
      `${API_BASE_URL}/api/typologies-immobilisation/${id}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la récupération de la typologie d’immobilisation.",
    );
  }
});

export const createTypologieImmobilisation = createAsyncThunk<
  TypologieImmobilisationResponse,
  TypologieImmobilisationRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('typologiesImmobilisation/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<TypologieImmobilisationResponse>(
      `${API_BASE_URL}/api/typologies-immobilisation`,
      payload,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Typologie d’immobilisation créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la création de la typologie d’immobilisation.",
    );
  }
});

export const editTypologieImmobilisation = createAsyncThunk<
  TypologieImmobilisationResponse,
  { id: number; updatedItem: TypologieImmobilisationRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('typologiesImmobilisation/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<TypologieImmobilisationResponse>(
      `${API_BASE_URL}/api/typologies-immobilisation/${id}`,
      updatedItem,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Typologie d’immobilisation modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la modification de la typologie d’immobilisation.",
    );
  }
});

export const deleteTypologieImmobilisation = createAsyncThunk<
  void,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('typologiesImmobilisation/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`${API_BASE_URL}/api/typologies-immobilisation/${id}`);
    dispatch(setToastOpen({ isOpen: true, message: 'Typologie d’immobilisation supprimée avec succès.' }));
    dispatch(getAllTypologiesImmobilisation({}));
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la suppression de la typologie d’immobilisation.",
    );
  }
});

const typologiesImmobilisationSlice = createSlice({
  name: 'typologiesImmobilisation',
  initialState,
  reducers: {
    setTypologieImmobilisation: (state, action: PayloadAction<TypologieImmobilisationResponse>) => {
      state.item = action.payload;
    },
    resetTypologieImmobilisation: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTypologiesImmobilisation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTypologiesImmobilisation.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllTypologiesImmobilisation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des typologies d’immobilisation.';
      })
      .addCase(
        getTypologieImmobilisationById.fulfilled,
        (state, action: PayloadAction<TypologieImmobilisationResponse>) => {
          state.item = action.payload;
        },
      )
      .addCase(createTypologieImmobilisation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de la typologie d’immobilisation.";
      })
      .addCase(editTypologieImmobilisation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de la typologie d’immobilisation.";
      })
      .addCase(deleteTypologieImmobilisation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de la typologie d’immobilisation.";
      });
  },
});

export const { setTypologieImmobilisation, resetTypologieImmobilisation } = typologiesImmobilisationSlice.actions;
export default typologiesImmobilisationSlice.reducer;
