import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ChargeRequest, ChargeResponse } from './charge-schemas';

const DATE_FIELDS: (keyof ChargeRequest)[] = ['dateDecaissement'];
const sanitizePayload = (payload: ChargeRequest): ChargeRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface ChargesState {
  item: ChargeResponse | null;
  allItems: ChargeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: ChargesState = {
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

export const getAllCharges = createAsyncThunk<
  { items: ChargeResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('charges/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: ChargeResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/charges?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des charges.');
  }
});

export const getChargeById = createAsyncThunk<ChargeResponse, number, { rejectValue: string }>(
  'charges/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ChargeResponse>(`${API_BASE_URL}/api/charges/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la charge.');
    }
  },
);

export const createCharge = createAsyncThunk<
  ChargeResponse,
  ChargeRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('charges/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ChargeResponse>(`${API_BASE_URL}/api/charges`, sanitizePayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Charge créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la charge.');
  }
});

export const editCharge = createAsyncThunk<
  ChargeResponse,
  { id: number; updatedItem: ChargeRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('charges/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ChargeResponse>(`${API_BASE_URL}/api/charges/${id}`, sanitizePayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Charge modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la charge.');
  }
});

export const deleteCharge = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'charges/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/charges/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Charge supprimée avec succès.' }));
      dispatch(getAllCharges({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la charge.');
    }
  },
);

const chargesSlice = createSlice({
  name: 'charges',
  initialState,
  reducers: {
    setCharge: (state, action: PayloadAction<ChargeResponse>) => {
      state.item = action.payload;
    },
    resetCharge: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCharges.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllCharges.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des charges.';
      })
      .addCase(getChargeById.fulfilled, (state, action: PayloadAction<ChargeResponse>) => {
        state.item = action.payload;
      })
      .addCase(createCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la charge.';
      })
      .addCase(editCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la charge.';
      })
      .addCase(deleteCharge.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la charge.';
      });
  },
});

export const { setCharge, resetCharge } = chargesSlice.actions;
export default chargesSlice.reducer;
