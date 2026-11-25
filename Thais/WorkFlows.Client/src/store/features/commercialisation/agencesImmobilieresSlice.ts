import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AgenceImmobiliereRequest, AgenceImmobiliereResponse } from './agence-immobiliere-schemas';

interface ErrorResponse {
  message?: string;
}

interface AgencesImmobilieresState {
  item: AgenceImmobiliereResponse | null;
  allItems: AgenceImmobiliereResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: AgencesImmobilieresState = {
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

export const getAllAgencesImmobilieres = createAsyncThunk<
  { items: AgenceImmobiliereResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('agencesImmobilieres/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: AgenceImmobiliereResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/agences-immobilieres?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des agences immobilières.');
  }
});

export const createAgenceImmobiliere = createAsyncThunk<
  AgenceImmobiliereResponse,
  AgenceImmobiliereRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('agencesImmobilieres/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<AgenceImmobiliereResponse>(`${API_BASE_URL}/api/agences-immobilieres`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Agence immobilière créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de l'agence immobilière.");
  }
});

const agencesImmobilieresSlice = createSlice({
  name: 'agencesImmobilieres',
  initialState,
  reducers: {
    setAgenceImmobiliere: (state, action: PayloadAction<AgenceImmobiliereResponse>) => {
      state.item = action.payload;
    },
    resetAgenceImmobiliere: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAgencesImmobilieres.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAgencesImmobilieres.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllAgencesImmobilieres.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des agences immobilières.';
      })
      .addCase(createAgenceImmobiliere.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de l'agence immobilière.";
      });
  },
});

export const { setAgenceImmobiliere, resetAgenceImmobiliere } = agencesImmobilieresSlice.actions;
export default agencesImmobilieresSlice.reducer;
