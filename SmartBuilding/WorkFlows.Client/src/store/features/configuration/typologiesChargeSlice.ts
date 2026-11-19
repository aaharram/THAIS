import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { TypologieChargeRequest, TypologieChargeResponse } from './typologieCharge-schemas';

interface ErrorResponse {
  message?: string;
}

interface TypologiesChargeState {
  item: TypologieChargeResponse | null;
  allItems: TypologieChargeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: TypologiesChargeState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllTypologiesCharge = createAsyncThunk<
  { items: TypologieChargeResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('typologiesCharge/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);

    const { data } = await api.get<{
      items: TypologieChargeResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/typologies-charge?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la récupération des typologies de charge.',
    );
  }
});

export const getTypologieChargeById = createAsyncThunk<
  TypologieChargeResponse,
  number,
  { rejectValue: string }
>('typologiesCharge/getById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<TypologieChargeResponse>(`${API_BASE_URL}/api/typologies-charge/${id}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la récupération de la typologie de charge.",
    );
  }
});

export const createTypologieCharge = createAsyncThunk<
  TypologieChargeResponse,
  TypologieChargeRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('typologiesCharge/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<TypologieChargeResponse>(`${API_BASE_URL}/api/typologies-charge`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Typologie de charge créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la création de la typologie de charge.",
    );
  }
});

export const editTypologieCharge = createAsyncThunk<
  TypologieChargeResponse,
  { id: number; updatedItem: TypologieChargeRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('typologiesCharge/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<TypologieChargeResponse>(
      `${API_BASE_URL}/api/typologies-charge/${id}`,
      updatedItem,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Typologie de charge modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la modification de la typologie de charge.",
    );
  }
});

export const deleteTypologieCharge = createAsyncThunk<
  void,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('typologiesCharge/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`${API_BASE_URL}/api/typologies-charge/${id}`);
    dispatch(setToastOpen({ isOpen: true, message: 'Typologie de charge supprimée avec succès.' }));
    dispatch(getAllTypologiesCharge({}));
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la suppression de la typologie de charge.",
    );
  }
});

const typologiesChargeSlice = createSlice({
  name: 'typologiesCharge',
  initialState,
  reducers: {
    setTypologieCharge: (state, action: PayloadAction<TypologieChargeResponse>) => {
      state.item = action.payload;
    },
    resetTypologieCharge: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTypologiesCharge.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTypologiesCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllTypologiesCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des typologies de charge.';
      })
      .addCase(getTypologieChargeById.fulfilled, (state, action: PayloadAction<TypologieChargeResponse>) => {
        state.item = action.payload;
      })
      .addCase(createTypologieCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de la typologie de charge.";
      })
      .addCase(editTypologieCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de la typologie de charge.";
      })
      .addCase(deleteTypologieCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de la typologie de charge.";
      });
  },
});

export const { setTypologieCharge, resetTypologieCharge } = typologiesChargeSlice.actions;
export default typologiesChargeSlice.reducer;
