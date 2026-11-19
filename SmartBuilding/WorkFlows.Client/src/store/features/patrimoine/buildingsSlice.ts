import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { BuildingRequest, BuildingResponse } from './building-schemas';

interface ErrorResponse {
  message?: string;
}

interface BuildingsState {
  item: BuildingResponse | null;
  allItems: BuildingResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: BuildingsState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllBuildings = createAsyncThunk<
  { items: BuildingResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('buildings/getAll', async (params, { rejectWithValue }) => {
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
      items: BuildingResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/buildings?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des immeubles.');
  }
});

export const getArchivedBuildings = createAsyncThunk<
  { items: BuildingResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('buildings/getArchived', async (params, { rejectWithValue }) => {
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
      items: BuildingResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/buildings/archives?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des actifs archivés.');
  }
});

export const reactivateBuilding = createAsyncThunk<
  BuildingResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('buildings/reactivate', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<BuildingResponse>(`${API_BASE_URL}/api/buildings/${id}/reactivate`);
    dispatch(setToastOpen({ isOpen: true, message: 'Actif réactivé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la réactivation de l'actif.");
  }
});

export const getBuildingById = createAsyncThunk<BuildingResponse, number, { rejectValue: string }>(
  'buildings/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BuildingResponse>(`${API_BASE_URL}/api/buildings/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'immeuble.");
    }
  },
);

const DATE_FIELDS: (keyof BuildingRequest)[] = [
  'dateAcquisition',
  'dateModificationValeur',
  'dateExpertiseTechnique',
  'dateDemandeExpertiseTechnique',
];

const sanitizeBuildingPayload = (payload: BuildingRequest): BuildingRequest =>
  nullifyEmptyDates(payload, DATE_FIELDS);

export const createBuilding = createAsyncThunk<
  BuildingResponse,
  BuildingRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('buildings/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<BuildingResponse>(`${API_BASE_URL}/api/buildings`, sanitizeBuildingPayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Actif créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de l'actif.");
  }
});

export const editBuilding = createAsyncThunk<
  BuildingResponse,
  { id: number; updatedItem: BuildingRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('buildings/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<BuildingResponse>(`${API_BASE_URL}/api/buildings/${id}`, sanitizeBuildingPayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Actif modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de l'actif.");
  }
});

export const deleteBuilding = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'buildings/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/buildings/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Actif supprimé avec succès.' }));
      dispatch(getAllBuildings({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de l'actif.");
    }
  },
);

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState,
  reducers: {
    setBuilding: (state, action: PayloadAction<BuildingResponse>) => {
      state.item = action.payload;
    },
    resetBuilding: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBuildings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBuildings.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllBuildings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des immeubles.';
      })
      .addCase(getArchivedBuildings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArchivedBuildings.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getArchivedBuildings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des actifs archivés.';
      })
      .addCase(reactivateBuilding.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la réactivation de l'actif.";
      })
      .addCase(getBuildingById.fulfilled, (state, action: PayloadAction<BuildingResponse>) => {
        state.item = action.payload;
      })
      .addCase(createBuilding.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de l'immeuble.";
      })
      .addCase(editBuilding.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de l'immeuble.";
      })
      .addCase(deleteBuilding.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de l'immeuble.";
      });
  },
});

export const { setBuilding, resetBuilding } = buildingsSlice.actions;
export default buildingsSlice.reducer;
