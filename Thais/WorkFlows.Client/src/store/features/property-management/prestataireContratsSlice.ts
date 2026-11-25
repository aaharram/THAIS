import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { PrestataireContratRequest, PrestataireContratResponse } from './prestataire-contrat-schemas';

const DATE_FIELDS: (keyof PrestataireContratRequest)[] = ['dateContrat', 'dateDebut', 'dateFin'];
const sanitizePayload = (payload: PrestataireContratRequest): PrestataireContratRequest =>
  nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface PrestataireContratsState {
  item: PrestataireContratResponse | null;
  allItems: PrestataireContratResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: PrestataireContratsState = {
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

export const getAllPrestataireContrats = createAsyncThunk<
  { items: PrestataireContratResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('prestataireContrats/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: PrestataireContratResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/prestataire-contrats?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des contrats.');
  }
});

export const getPrestataireContratById = createAsyncThunk<PrestataireContratResponse, number, { rejectValue: string }>(
  'prestataireContrats/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PrestataireContratResponse>(`${API_BASE_URL}/api/prestataire-contrats/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du contrat.');
    }
  },
);

export const createPrestataireContrat = createAsyncThunk<
  PrestataireContratResponse,
  PrestataireContratRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('prestataireContrats/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PrestataireContratResponse>(
      `${API_BASE_URL}/api/prestataire-contrats`,
      sanitizePayload(payload),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Contrat créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du contrat.');
  }
});

export const editPrestataireContrat = createAsyncThunk<
  PrestataireContratResponse,
  { id: number; updatedItem: PrestataireContratRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('prestataireContrats/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<PrestataireContratResponse>(
      `${API_BASE_URL}/api/prestataire-contrats/${id}`,
      sanitizePayload(updatedItem),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Contrat modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du contrat.');
  }
});

export const deletePrestataireContrat = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'prestataireContrats/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/prestataire-contrats/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Contrat supprimé avec succès.' }));
      dispatch(getAllPrestataireContrats({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du contrat.');
    }
  },
);

const prestataireContratsSlice = createSlice({
  name: 'prestataireContrats',
  initialState,
  reducers: {
    setPrestataireContrat: (state, action: PayloadAction<PrestataireContratResponse>) => {
      state.item = action.payload;
    },
    resetPrestataireContrat: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPrestataireContrats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPrestataireContrats.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllPrestataireContrats.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des contrats.';
      })
      .addCase(getPrestataireContratById.fulfilled, (state, action: PayloadAction<PrestataireContratResponse>) => {
        state.item = action.payload;
      })
      .addCase(createPrestataireContrat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du contrat.';
      })
      .addCase(editPrestataireContrat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du contrat.';
      })
      .addCase(deletePrestataireContrat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du contrat.';
      });
  },
});

export const { setPrestataireContrat, resetPrestataireContrat } = prestataireContratsSlice.actions;
export default prestataireContratsSlice.reducer;
