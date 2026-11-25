import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ProvisionRequest, ProvisionResponse } from './provision-schemas';

interface ErrorResponse {
  message?: string;
}

interface ProvisionsState {
  item: ProvisionResponse | null;
  allItems: ProvisionResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: ProvisionsState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllProvisions = createAsyncThunk<
  { items: ProvisionResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('provisions/getAll', async (params, { rejectWithValue }) => {
  try {
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

    const { data } = await api.get<{
      items: ProvisionResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/provisions?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des provisions.');
  }
});

export const getProvisionById = createAsyncThunk<ProvisionResponse, number, { rejectValue: string }>(
  'provisions/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ProvisionResponse>(`${API_BASE_URL}/api/provisions/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la provision.');
    }
  },
);

export const createProvision = createAsyncThunk<
  ProvisionResponse,
  ProvisionRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('provisions/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ProvisionResponse>(`${API_BASE_URL}/api/provisions`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Provision créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la provision.');
  }
});

export const editProvision = createAsyncThunk<
  ProvisionResponse,
  { id: number; updatedItem: ProvisionRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('provisions/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ProvisionResponse>(`${API_BASE_URL}/api/provisions/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Provision modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la provision.');
  }
});

export const deleteProvision = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'provisions/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/provisions/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Provision supprimée avec succès.' }));
      dispatch(getAllProvisions({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la provision.');
    }
  },
);

const provisionsSlice = createSlice({
  name: 'provisions',
  initialState,
  reducers: {
    resetProvision: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllProvisions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProvisions.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllProvisions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des provisions.';
      })
      .addCase(getProvisionById.fulfilled, (state, action: PayloadAction<ProvisionResponse>) => {
        state.item = action.payload;
      })
      .addCase(createProvision.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la provision.';
      })
      .addCase(editProvision.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la provision.';
      })
      .addCase(deleteProvision.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la provision.';
      });
  },
});

export const { resetProvision } = provisionsSlice.actions;
export default provisionsSlice.reducer;
