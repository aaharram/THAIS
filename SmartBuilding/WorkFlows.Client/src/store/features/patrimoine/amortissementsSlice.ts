import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  AmortissementPeriodeOption,
  AmortissementValidationRequest,
  AmortissementValidationResult,
  TableauAmortissementImportRequest,
  TableauAmortissementImportResult,
  TableauAmortissementRequest,
  TableauAmortissementResponse,
} from './amortissement-schemas';

interface ErrorResponse {
  message?: string;
}

interface AmortissementsState {
  item: TableauAmortissementResponse | null;
  allItems: TableauAmortissementResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  periodesValidation: AmortissementPeriodeOption[];
  error: string | null;
  loading: boolean;
}

const initialState: AmortissementsState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  periodesValidation: [],
  error: null,
  loading: false,
};

export const getAllAmortissements = createAsyncThunk<
  { items: TableauAmortissementResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('amortissements/getAll', async (params, { rejectWithValue }) => {
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
      items: TableauAmortissementResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/tableau-amortissement?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de la récupération du tableau d'amortissement.",
    );
  }
});

export const getAmortissementById = createAsyncThunk<
  TableauAmortissementResponse,
  number,
  { rejectValue: string }
>('amortissements/getById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<TableauAmortissementResponse>(
      `${API_BASE_URL}/api/tableau-amortissement/${id}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'amortissement.");
  }
});

export const createAmortissement = createAsyncThunk<
  TableauAmortissementResponse,
  TableauAmortissementRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('amortissements/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<TableauAmortissementResponse>(
      `${API_BASE_URL}/api/tableau-amortissement`,
      payload,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Amortissement créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de l'amortissement.");
  }
});

export const editAmortissement = createAsyncThunk<
  TableauAmortissementResponse,
  { id: number; updatedItem: TableauAmortissementRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('amortissements/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<TableauAmortissementResponse>(
      `${API_BASE_URL}/api/tableau-amortissement/${id}`,
      updatedItem,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Amortissement modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de l'amortissement.");
  }
});

export const importAmortissements = createAsyncThunk<
  TableauAmortissementImportResult,
  TableauAmortissementImportRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('amortissements/import', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<TableauAmortissementImportResult>(
      `${API_BASE_URL}/api/tableau-amortissement/import`,
      payload,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message:
          data.erreurs.length > 0
            ? `${data.importes} ligne(s) importée(s), ${data.erreurs.length} ignorée(s).`
            : `${data.importes} ligne(s) importée(s) avec succès.`,
      }),
    );
    dispatch(getAllAmortissements({}));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'importation.");
  }
});

export const getPeriodesValidation = createAsyncThunk<
  AmortissementPeriodeOption[],
  void,
  { rejectValue: string }
>('amortissements/getPeriodesValidation', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<AmortissementPeriodeOption[]>(
      `${API_BASE_URL}/api/tableau-amortissement/periodes-validation`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des périodes.');
  }
});

export const validerPeriodeAmortissement = createAsyncThunk<
  AmortissementValidationResult,
  AmortissementValidationRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('amortissements/validerPeriode', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<AmortissementValidationResult>(
      `${API_BASE_URL}/api/tableau-amortissement/valider`,
      payload,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: `Tableau d'amortissement validé : ${data.lignesMisesAJour} ligne(s) mise(s) à jour.`,
      }),
    );
    dispatch(getAllAmortissements({}));
    dispatch(getPeriodesValidation());
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la validation.');
  }
});

export const deleteAmortissement = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'amortissements/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/tableau-amortissement/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Amortissement supprimé avec succès.' }));
      dispatch(getAllAmortissements({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de l'amortissement.");
    }
  },
);

const amortissementsSlice = createSlice({
  name: 'amortissements',
  initialState,
  reducers: {
    resetAmortissement: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAmortissements.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAmortissements.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllAmortissements.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Échec de la récupération du tableau d'amortissement.";
      })
      .addCase(getAmortissementById.fulfilled, (state, action: PayloadAction<TableauAmortissementResponse>) => {
        state.item = action.payload;
      })
      .addCase(createAmortissement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de l'amortissement.";
      })
      .addCase(editAmortissement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de l'amortissement.";
      })
      .addCase(deleteAmortissement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de l'amortissement.";
      })
      .addCase(importAmortissements.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'importation.";
      })
      .addCase(getPeriodesValidation.fulfilled, (state, action: PayloadAction<AmortissementPeriodeOption[]>) => {
        state.periodesValidation = action.payload;
      })
      .addCase(validerPeriodeAmortissement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la validation.';
      });
  },
});

export const { resetAmortissement } = amortissementsSlice.actions;
export default amortissementsSlice.reducer;
