import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ExpertiseRequest, ExpertiseResponse, ExpertiseSummary } from './expertise-schemas';

interface ErrorResponse {
  message?: string;
}

interface ExpertisesState {
  item: ExpertiseResponse | null;
  allItems: ExpertiseSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  versions: ExpertiseResponse[];
  versionsTotalCount: number;
  error: string | null;
  loading: boolean;
}

const initialState: ExpertisesState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  versions: [],
  versionsTotalCount: 0,
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

export const getExpertisesSummary = createAsyncThunk<
  { items: ExpertiseSummary[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('expertises/getSummary', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: ExpertiseSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/expertises/summary?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des expertises.');
  }
});

export const getAllExpertises = createAsyncThunk<
  { items: ExpertiseResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('expertises/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: ExpertiseResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/expertises?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des expertises.');
  }
});

export const getExpertiseById = createAsyncThunk<ExpertiseResponse, number, { rejectValue: string }>(
  'expertises/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ExpertiseResponse>(`${API_BASE_URL}/api/expertises/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'expertise.");
    }
  },
);

export const createExpertise = createAsyncThunk<
  ExpertiseResponse,
  ExpertiseRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('expertises/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ExpertiseResponse>(`${API_BASE_URL}/api/expertises`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Expertise créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de l'expertise.");
  }
});

export const editExpertise = createAsyncThunk<
  ExpertiseResponse,
  { id: number; updatedItem: ExpertiseRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('expertises/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ExpertiseResponse>(`${API_BASE_URL}/api/expertises/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Expertise modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de l'expertise.");
  }
});

export const deleteExpertise = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'expertises/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/expertises/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Expertise supprimée avec succès.' }));
      dispatch(getExpertisesSummary({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de l'expertise.");
    }
  },
);

const expertisesSlice = createSlice({
  name: 'expertises',
  initialState,
  reducers: {
    resetExpertise: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExpertisesSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getExpertisesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getExpertisesSummary.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des expertises.';
      })
      .addCase(getAllExpertises.fulfilled, (state, action) => {
        state.versions = action.payload.items;
        state.versionsTotalCount = action.payload.totalCount;
      })
      .addCase(getExpertiseById.fulfilled, (state, action: PayloadAction<ExpertiseResponse>) => {
        state.item = action.payload;
      })
      .addCase(createExpertise.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de l'expertise.";
      })
      .addCase(editExpertise.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de l'expertise.";
      })
      .addCase(deleteExpertise.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de l'expertise.";
      });
  },
});

export const { resetExpertise } = expertisesSlice.actions;
export default expertisesSlice.reducer;
