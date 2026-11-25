import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AssuranceRequest, AssuranceResponse } from './assurance-schemas';

const DATE_FIELDS: (keyof AssuranceRequest)[] = ['dateEffetContrat'];
const sanitizePayload = (payload: AssuranceRequest): AssuranceRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface AssurancesState {
  item: AssuranceResponse | null;
  allItems: AssuranceResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: AssurancesState = {
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

export const getAllAssurances = createAsyncThunk<
  { items: AssuranceResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('assurances/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: AssuranceResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/assurances?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des assurances.');
  }
});

export const getAssuranceById = createAsyncThunk<AssuranceResponse, number, { rejectValue: string }>(
  'assurances/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<AssuranceResponse>(`${API_BASE_URL}/api/assurances/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'assurance.");
    }
  },
);

export const createAssurance = createAsyncThunk<
  AssuranceResponse,
  AssuranceRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('assurances/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<AssuranceResponse>(`${API_BASE_URL}/api/assurances`, sanitizePayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Assurance créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de l'assurance.");
  }
});

export const editAssurance = createAsyncThunk<
  AssuranceResponse,
  { id: number; updatedItem: AssuranceRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('assurances/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<AssuranceResponse>(`${API_BASE_URL}/api/assurances/${id}`, sanitizePayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Assurance modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de l'assurance.");
  }
});

export const deleteAssurance = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'assurances/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/assurances/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Assurance supprimée avec succès.' }));
      dispatch(getAllAssurances({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de l'assurance.");
    }
  },
);

const assurancesSlice = createSlice({
  name: 'assurances',
  initialState,
  reducers: {
    setAssurance: (state, action: PayloadAction<AssuranceResponse>) => {
      state.item = action.payload;
    },
    resetAssurance: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAssurances.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAssurances.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllAssurances.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des assurances.';
      })
      .addCase(getAssuranceById.fulfilled, (state, action: PayloadAction<AssuranceResponse>) => {
        state.item = action.payload;
      })
      .addCase(createAssurance.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de l'assurance.";
      })
      .addCase(editAssurance.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de l'assurance.";
      })
      .addCase(deleteAssurance.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de l'assurance.";
      });
  },
});

export const { setAssurance, resetAssurance } = assurancesSlice.actions;
export default assurancesSlice.reducer;
