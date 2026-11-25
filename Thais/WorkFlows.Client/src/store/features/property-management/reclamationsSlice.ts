import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ReclamationRequest, ReclamationResponse } from './reclamation-schemas';

const DATE_FIELDS: (keyof ReclamationRequest)[] = ['dateReclamation'];
const sanitizePayload = (payload: ReclamationRequest): ReclamationRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface ReclamationsState {
  item: ReclamationResponse | null;
  allItems: ReclamationResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: ReclamationsState = {
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

export const getAllReclamations = createAsyncThunk<
  { items: ReclamationResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('reclamations/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: ReclamationResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/reclamations?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des réclamations.');
  }
});

export const getReclamationById = createAsyncThunk<ReclamationResponse, number, { rejectValue: string }>(
  'reclamations/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ReclamationResponse>(`${API_BASE_URL}/api/reclamations/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la réclamation.');
    }
  },
);

export const createReclamation = createAsyncThunk<
  ReclamationResponse,
  ReclamationRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('reclamations/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ReclamationResponse>(`${API_BASE_URL}/api/reclamations`, sanitizePayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Réclamation créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la réclamation.');
  }
});

export const editReclamation = createAsyncThunk<
  ReclamationResponse,
  { id: number; updatedItem: ReclamationRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('reclamations/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ReclamationResponse>(
      `${API_BASE_URL}/api/reclamations/${id}`,
      sanitizePayload(updatedItem),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Réclamation modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la réclamation.');
  }
});

export const deleteReclamation = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'reclamations/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/reclamations/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Réclamation supprimée avec succès.' }));
      dispatch(getAllReclamations({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la réclamation.');
    }
  },
);

const reclamationsSlice = createSlice({
  name: 'reclamations',
  initialState,
  reducers: {
    setReclamation: (state, action: PayloadAction<ReclamationResponse>) => {
      state.item = action.payload;
    },
    resetReclamation: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllReclamations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllReclamations.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllReclamations.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des réclamations.';
      })
      .addCase(getReclamationById.fulfilled, (state, action: PayloadAction<ReclamationResponse>) => {
        state.item = action.payload;
      })
      .addCase(createReclamation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la réclamation.';
      })
      .addCase(editReclamation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la réclamation.';
      })
      .addCase(deleteReclamation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la réclamation.';
      });
  },
});

export const { setReclamation, resetReclamation } = reclamationsSlice.actions;
export default reclamationsSlice.reducer;
