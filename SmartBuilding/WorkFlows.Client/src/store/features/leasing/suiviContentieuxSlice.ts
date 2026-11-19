import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { SuiviContentieuxRequest, SuiviContentieuxResponse } from './suivi-contentieux-schemas';

const DATE_FIELDS: (keyof SuiviContentieuxRequest)[] = ['dateDebutContentieux', 'dateEncaissement'];
const sanitizePayload = (payload: SuiviContentieuxRequest): SuiviContentieuxRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface SuiviContentieuxState {
  item: SuiviContentieuxResponse | null;
  allItems: SuiviContentieuxResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: SuiviContentieuxState = {
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

export const getAllSuiviContentieux = createAsyncThunk<
  { items: SuiviContentieuxResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('suiviContentieux/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: SuiviContentieuxResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/suivi-contentieux?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des dossiers.');
  }
});

export const getSuiviContentieuxById = createAsyncThunk<SuiviContentieuxResponse, number, { rejectValue: string }>(
  'suiviContentieux/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<SuiviContentieuxResponse>(`${API_BASE_URL}/api/suivi-contentieux/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du dossier.');
    }
  },
);

export const createSuiviContentieux = createAsyncThunk<
  SuiviContentieuxResponse,
  SuiviContentieuxRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('suiviContentieux/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<SuiviContentieuxResponse>(`${API_BASE_URL}/api/suivi-contentieux`, sanitizePayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Dossier créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du dossier.');
  }
});

export const editSuiviContentieux = createAsyncThunk<
  SuiviContentieuxResponse,
  { id: number; updatedItem: SuiviContentieuxRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('suiviContentieux/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<SuiviContentieuxResponse>(
      `${API_BASE_URL}/api/suivi-contentieux/${id}`,
      sanitizePayload(updatedItem),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Dossier modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du dossier.');
  }
});

export const deleteSuiviContentieux = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'suiviContentieux/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/suivi-contentieux/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Dossier supprimé avec succès.' }));
      dispatch(getAllSuiviContentieux({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du dossier.');
    }
  },
);

const suiviContentieuxSlice = createSlice({
  name: 'suiviContentieux',
  initialState,
  reducers: {
    setSuiviContentieux: (state, action: PayloadAction<SuiviContentieuxResponse>) => {
      state.item = action.payload;
    },
    resetSuiviContentieux: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSuiviContentieux.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSuiviContentieux.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllSuiviContentieux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des dossiers.';
      })
      .addCase(getSuiviContentieuxById.fulfilled, (state, action: PayloadAction<SuiviContentieuxResponse>) => {
        state.item = action.payload;
      })
      .addCase(createSuiviContentieux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du dossier.';
      })
      .addCase(editSuiviContentieux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du dossier.';
      })
      .addCase(deleteSuiviContentieux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du dossier.';
      });
  },
});

export const { setSuiviContentieux, resetSuiviContentieux } = suiviContentieuxSlice.actions;
export default suiviContentieuxSlice.reducer;
