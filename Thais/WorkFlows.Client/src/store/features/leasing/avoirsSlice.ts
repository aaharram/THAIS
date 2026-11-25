import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AvoirRequest, AvoirResponse } from './avoir-schemas';

interface ErrorResponse {
  message?: string;
}

interface AvoirsState {
  allItems: AvoirResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: AvoirsState = {
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

export const getAllAvoirs = createAsyncThunk<
  { items: AvoirResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('avoirs/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: AvoirResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/avoirs?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des avoirs.');
  }
});

export const creerAvoir = createAsyncThunk<
  AvoirResponse,
  AvoirRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('avoirs/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<AvoirResponse>(`${API_BASE_URL}/api/avoirs`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Avoir émis avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'émission de l'avoir.");
  }
});

const avoirsSlice = createSlice({
  name: 'avoirs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllAvoirs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAvoirs.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllAvoirs.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des avoirs.';
      })
      .addCase(creerAvoir.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'émission de l'avoir.";
      });
  },
});

export default avoirsSlice.reducer;
