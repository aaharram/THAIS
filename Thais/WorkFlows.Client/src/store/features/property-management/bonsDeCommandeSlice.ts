import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  BonDeCommandeImportRequest,
  BonDeCommandeImportResult,
  BonDeCommandeRequest,
  BonDeCommandeResponse,
} from './bon-de-commande-schemas';

const DATE_FIELDS: (keyof BonDeCommandeRequest)[] = ['dateCommande', 'dateReception'];
const sanitizePayload = (payload: BonDeCommandeRequest): BonDeCommandeRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface BonsDeCommandeState {
  item: BonDeCommandeResponse | null;
  allItems: BonDeCommandeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: BonsDeCommandeState = {
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

export const getAllBonsDeCommande = createAsyncThunk<
  { items: BonDeCommandeResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('bonsDeCommande/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: BonDeCommandeResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/bons-de-commande?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des bons de commande.');
  }
});

export const getBonDeCommandeById = createAsyncThunk<BonDeCommandeResponse, number, { rejectValue: string }>(
  'bonsDeCommande/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BonDeCommandeResponse>(`${API_BASE_URL}/api/bons-de-commande/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du bon de commande.');
    }
  },
);

export const createBonDeCommande = createAsyncThunk<
  BonDeCommandeResponse,
  BonDeCommandeRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('bonsDeCommande/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<BonDeCommandeResponse>(
      `${API_BASE_URL}/api/bons-de-commande`,
      sanitizePayload(payload),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Bon de commande créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du bon de commande.');
  }
});

export const editBonDeCommande = createAsyncThunk<
  BonDeCommandeResponse,
  { id: number; updatedItem: BonDeCommandeRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('bonsDeCommande/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<BonDeCommandeResponse>(
      `${API_BASE_URL}/api/bons-de-commande/${id}`,
      sanitizePayload(updatedItem),
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Bon de commande modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du bon de commande.');
  }
});

export const importBonsDeCommande = createAsyncThunk<
  BonDeCommandeImportResult,
  BonDeCommandeImportRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('bonsDeCommande/import', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<BonDeCommandeImportResult>(`${API_BASE_URL}/api/bons-de-commande/import`, payload);
    dispatch(
      setToastOpen({
        isOpen: true,
        message:
          data.erreurs.length > 0
            ? `${data.importes} bon(s) importé(s), ${data.erreurs.length} ignoré(s).`
            : `${data.importes} bon(s) de commande importé(s) avec succès.`,
      }),
    );
    dispatch(getAllBonsDeCommande({}));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'importation.");
  }
});

export const deleteBonDeCommande = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'bonsDeCommande/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/bons-de-commande/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Bon de commande supprimé avec succès.' }));
      dispatch(getAllBonsDeCommande({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message = axiosError.response?.data?.message || 'Échec de la suppression du bon de commande.';
      dispatch(setToastOpen({ isOpen: true, error: message }));
      return rejectWithValue(message);
    }
  },
);

const bonsDeCommandeSlice = createSlice({
  name: 'bonsDeCommande',
  initialState,
  reducers: {
    setBonDeCommande: (state, action: PayloadAction<BonDeCommandeResponse>) => {
      state.item = action.payload;
    },
    resetBonDeCommande: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBonsDeCommande.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBonsDeCommande.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllBonsDeCommande.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des bons de commande.';
      })
      .addCase(getBonDeCommandeById.fulfilled, (state, action: PayloadAction<BonDeCommandeResponse>) => {
        state.item = action.payload;
      })
      .addCase(createBonDeCommande.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du bon de commande.';
      })
      .addCase(editBonDeCommande.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du bon de commande.';
      })
      .addCase(deleteBonDeCommande.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du bon de commande.';
      })
      .addCase(importBonsDeCommande.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'importation.";
      });
  },
});

export const { setBonDeCommande, resetBonDeCommande } = bonsDeCommandeSlice.actions;
export default bonsDeCommandeSlice.reducer;
