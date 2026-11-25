import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { RevisionLoyerRequest, RevisionLoyerResponse, RevisionLoyerSummary } from './revision-loyer-schemas';

interface ErrorResponse {
  message?: string;
}

interface RevisionsLoyerState {
  item: RevisionLoyerResponse | null;
  allItems: RevisionLoyerSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  historique: RevisionLoyerResponse[];
  historiqueTotalCount: number;
  error: string | null;
  loading: boolean;
}

const initialState: RevisionsLoyerState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  historique: [],
  historiqueTotalCount: 0,
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

export const getRevisionsLoyerSummary = createAsyncThunk<
  { items: RevisionLoyerSummary[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('revisionsLoyer/getSummary', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: RevisionLoyerSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/revisions-loyer/summary?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des révisions de loyer.');
  }
});

export const getRevisionsLoyerHistorique = createAsyncThunk<
  { items: RevisionLoyerResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('revisionsLoyer/getHistorique', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: RevisionLoyerResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/revisions-loyer?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'historique.");
  }
});

export const getRevisionLoyerById = createAsyncThunk<RevisionLoyerResponse, number, { rejectValue: string }>(
  'revisionsLoyer/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<RevisionLoyerResponse>(`${API_BASE_URL}/api/revisions-loyer/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la révision.');
    }
  },
);

export const createRevisionLoyer = createAsyncThunk<
  RevisionLoyerResponse,
  RevisionLoyerRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('revisionsLoyer/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<RevisionLoyerResponse>(`${API_BASE_URL}/api/revisions-loyer`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Révision de loyer créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la révision de loyer.');
  }
});

export const editRevisionLoyer = createAsyncThunk<
  RevisionLoyerResponse,
  { id: number; updatedItem: RevisionLoyerRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('revisionsLoyer/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<RevisionLoyerResponse>(`${API_BASE_URL}/api/revisions-loyer/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Révision de loyer modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la révision de loyer.');
  }
});

export const deleteRevisionLoyer = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'revisionsLoyer/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/revisions-loyer/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Révision de loyer supprimée avec succès.' }));
      dispatch(getRevisionsLoyerSummary({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la révision de loyer.');
    }
  },
);

const revisionsLoyerSlice = createSlice({
  name: 'revisionsLoyer',
  initialState,
  reducers: {
    resetRevisionLoyer: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRevisionsLoyerSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRevisionsLoyerSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getRevisionsLoyerSummary.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des révisions de loyer.';
      })
      .addCase(getRevisionsLoyerHistorique.fulfilled, (state, action) => {
        state.historique = action.payload.items;
        state.historiqueTotalCount = action.payload.totalCount;
      })
      .addCase(getRevisionLoyerById.fulfilled, (state, action: PayloadAction<RevisionLoyerResponse>) => {
        state.item = action.payload;
      })
      .addCase(createRevisionLoyer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la révision de loyer.';
      })
      .addCase(editRevisionLoyer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la révision de loyer.';
      })
      .addCase(deleteRevisionLoyer.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la révision de loyer.';
      });
  },
});

export const { resetRevisionLoyer } = revisionsLoyerSlice.actions;
export default revisionsLoyerSlice.reducer;
