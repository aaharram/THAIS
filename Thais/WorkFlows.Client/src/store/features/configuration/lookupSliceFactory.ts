import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  AsyncThunk,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  Reducer,
} from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { LookupRequest, LookupResponse } from './lookup-schemas';

interface ErrorResponse {
  message?: string;
}

export interface LookupState {
  item: LookupResponse | null;
  allItems: LookupResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  message: string | null;
  error: string | null;
  loading: boolean;
}

const initialState: LookupState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  message: null,
  error: null,
  loading: false,
};

type GetAllResult = { items: LookupResponse[]; totalCount: number; pageNumber: number; pageSize: number };

export interface LookupSliceInstance {
  apiPath: string; // segment d'URL de la liste (villes, banques…), aussi utilisé par l'import Excel
  reducer: Reducer<LookupState>;
  setItem: ActionCreatorWithPayload<LookupResponse>;
  resetItem: ActionCreatorWithoutPayload;
  getAll: AsyncThunk<GetAllResult, IFetchParams, { rejectValue: string }>;
  getById: AsyncThunk<LookupResponse, number, { rejectValue: string }>;
  create: AsyncThunk<LookupResponse, LookupRequest, { dispatch: AppDispatch; rejectValue: string }>;
  edit: AsyncThunk<
    LookupResponse,
    { id: number; updatedItem: LookupRequest },
    { dispatch: AppDispatch; rejectValue: string }
  >;
  remove: AsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>;
}

export function createLookupSlice(name: string, apiPath: string): LookupSliceInstance {
  const getAll = createAsyncThunk<
    { items: LookupResponse[]; totalCount: number; pageNumber: number; pageSize: number },
    IFetchParams,
    { rejectValue: string }
  >(`${name}/getAll`, async (params, { rejectWithValue }) => {
    try {
      const urlParams = new URLSearchParams();

      if (params.forSelect !== undefined) urlParams.append('forSelect', String(params.forSelect));
      urlParams.append('pageNumber', String(params.pageNumber || 1));
      urlParams.append('pageSize', String(params.pageSize || 10));

      if (params.search) {
        urlParams.append('search', params.search);
      }

      if (params.sortField && params.sortOrder !== 0) {
        urlParams.append('SortField', params.sortField);
        urlParams.append('SortOrder', String(params.sortOrder === 2 ? 1 : 0));
      }

      const { data } = await api.get<{
        items: LookupResponse[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
      }>(`${API_BASE_URL}/api/${apiPath}?${urlParams.toString()}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la récupération des données.',
      );
    }
  });

  const getById = createAsyncThunk<LookupResponse, number, { rejectValue: string }>(
    `${name}/getById`,
    async (id, { rejectWithValue }) => {
      try {
        const { data } = await api.get<LookupResponse>(`${API_BASE_URL}/api/${apiPath}/${id}`);
        return data;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return rejectWithValue(
          axiosError.response?.data?.message || "Échec de la récupération de l'élément.",
        );
      }
    },
  );

  const create = createAsyncThunk<
    LookupResponse,
    LookupRequest,
    { dispatch: AppDispatch; rejectValue: string }
  >(`${name}/create`, async (newItem, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post<LookupResponse>(`${API_BASE_URL}/api/${apiPath}`, newItem);
      dispatch(setToastOpen({ isOpen: true, message: 'Élément créé avec succès.' }));
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Échec de la création de l'élément.",
      );
    }
  });

  const edit = createAsyncThunk<
    LookupResponse,
    { id: number; updatedItem: LookupRequest },
    { dispatch: AppDispatch; rejectValue: string }
  >(`${name}/edit`, async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.put<LookupResponse>(
        `${API_BASE_URL}/api/${apiPath}/${id}`,
        updatedItem,
      );
      dispatch(setToastOpen({ isOpen: true, message: 'Élément modifié avec succès.' }));
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Échec de la modification de l'élément.",
      );
    }
  });

  const remove = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
    `${name}/delete`,
    async (id, { dispatch, rejectWithValue }) => {
      try {
        await api.delete(`${API_BASE_URL}/api/${apiPath}/${id}`);
        dispatch(setToastOpen({ isOpen: true, message: 'Élément supprimé avec succès.' }));
        dispatch(getAll({}));
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return rejectWithValue(
          axiosError.response?.data?.message || "Échec de la suppression de l'élément.",
        );
      }
    },
  );

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setItem: (state, action: PayloadAction<LookupResponse>) => {
        state.item = action.payload;
      },
      resetItem: (state) => {
        state.item = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(create.pending, (state) => {
          state.loading = true;
        })
        .addCase(create.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(create.rejected, (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Échec de la création de l'élément.";
        })
        .addCase(getById.pending, (state) => {
          state.loading = true;
        })
        .addCase(getById.fulfilled, (state, action: PayloadAction<LookupResponse>) => {
          state.loading = false;
          state.item = action.payload;
        })
        .addCase(getById.rejected, (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Échec de la récupération de l'élément.";
        })
        .addCase(getAll.pending, (state) => {
          state.loading = true;
        })
        .addCase(getAll.fulfilled, (state, action) => {
          state.loading = false;
          state.allItems = action.payload.items;
          state.totalCount = action.payload.totalCount;
          state.pageNumber = action.payload.pageNumber;
          state.pageSize = action.payload.pageSize;
        })
        .addCase(getAll.rejected, (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Échec de la récupération des données.';
        })
        .addCase(edit.pending, (state) => {
          state.loading = true;
        })
        .addCase(edit.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(edit.rejected, (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Échec de la modification de l'élément.";
        })
        .addCase(remove.rejected, (state, action: PayloadAction<string | undefined>) => {
          state.error = action.payload || "Échec de la suppression de l'élément.";
        });
    },
  });

  return {
    apiPath,
    reducer: slice.reducer,
    setItem: slice.actions.setItem,
    resetItem: slice.actions.resetItem,
    getAll,
    getById,
    create,
    edit,
    remove,
  };
}

export type LookupSlice = LookupSliceInstance;
