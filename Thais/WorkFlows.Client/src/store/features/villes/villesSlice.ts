import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { VilleResponse } from './villes-schemas';

interface VilleState {
  ville: VilleResponse | null;
  allVilles: VilleResponse[];
  villesByProvince: VilleResponse[];
  villesByCountry: VilleResponse[];
  uniqueColumnValues: Record<
    string,
    Array<{ value: string | number; label: string; count: number }>
  >;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  message: string | null;
  error: string | null;
  loading: boolean;
  toastOpen: boolean;
}

interface ErrorResponse {
  message?: string;
}

const initialState: VilleState = {
  ville: null,
  allVilles: [],
  villesByProvince: [],
  villesByCountry: [],
  uniqueColumnValues: {},
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  message: null,
  error: null,
  loading: false,
  toastOpen: false,
};

export const getUniqueColumnValues = createAsyncThunk<
  { columnName: string; values: Array<{ value: string | number; label: string; count: number }> }[],
  string[],
  { rejectValue: string }
>('batiment/getUniqueColumnValues', async (columnNames, { rejectWithValue }) => {
  try {
    
    const { data } = await api.post<
      {
        columnName: string;
        values: Array<{ value: string | number; label: string; count: number }>;
      }[]
    >(`${API_BASE_URL}/api/cities/unique-values`, { columnNames });
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        `Échec de la récupération des valeurs uniques pour la colonne ${columnNames}.`,
    );
  }
});

export const getAllVilles = createAsyncThunk<
  { items: VilleResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('ville/getAllVilles', async (params, { rejectWithValue }) => {
  try {
    
    const urlParams = new URLSearchParams();

    if (params.forSelect !== undefined) urlParams.append('forSelect', String(params.forSelect));
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));

    if (params.search) {
      urlParams.append('search', params.search);
    }

    if (params.filters) {
      let filterIndex = 0;
      for (const [field, values] of Object.entries(params.filters)) {
        urlParams.append(`filters[${filterIndex}].field`, field);

        values.forEach((value, valueIndex) => {
          urlParams.append(`filters[${filterIndex}].values[${valueIndex}]`, String(value));
        });

        filterIndex++;
      }
    }

    if (params.sortField && params.sortOrder !== 0) {
      urlParams.append('SortField', params.sortField);
      urlParams.append('SortOrder', String(params.sortOrder === 2 ? 1 : 0));
    }

    const { data } = await api.get<{
      items: VilleResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/cities?${urlParams.toString()}`);

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la récupération des villes.',
    );
  }
});

export const getVillesByProvince = createAsyncThunk<
  { items: VilleResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  { provinceId: number; forSelect?: boolean; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  'ville/getVillesByProvince',
  async ({ provinceId, forSelect, pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      
      const params = new URLSearchParams();

      if (forSelect !== undefined) params.append('forSelect', String(forSelect));
      params.append('pageNumber', String(pageNumber));
      params.append('pageSize', String(pageSize));

      const { data } = await api.get<{
        items: VilleResponse[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
      }>(`${API_BASE_URL}/api/cities/provinces/${provinceId}/cities?${params.toString()}`);

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la récupération des villes par province.',
      );
    }
  },
);

export const getVillesByCountry = createAsyncThunk<
  { items: VilleResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  { countryId: number; forSelect?: boolean; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  'ville/getVillesByCountry',
  async ({ countryId, forSelect, pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      
      const params = new URLSearchParams();

      if (forSelect !== undefined) params.append('forSelect', String(forSelect));
      params.append('pageNumber', String(pageNumber));
      params.append('pageSize', String(pageSize));

      const { data } = await api.get<{
        items: VilleResponse[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
      }>(`${API_BASE_URL}/api/cities/countries/${countryId}/cities?${params.toString()}`);

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la récupération des villes par pays.',
      );
    }
  },
);

const villeSlice = createSlice({
  name: 'ville',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllVilles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllVilles.fulfilled, (state, action) => {
        state.loading = false;
        state.allVilles = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllVilles.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des villes.';
      })

      .addCase(getVillesByProvince.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVillesByProvince.fulfilled, (state, action) => {
        state.loading = false;
        state.villesByProvince = action.payload.items;
      })
      .addCase(getVillesByProvince.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors du chargement des villes.';
      })

      .addCase(getVillesByCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVillesByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.villesByCountry = action.payload.items;
      })
      .addCase(getVillesByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors du chargement des villes.';
      })
      .addCase(getUniqueColumnValues.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((columnData) => {
          state.uniqueColumnValues[columnData.columnName] = columnData.values;
        });
      })
      .addCase(
        getUniqueColumnValues.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.error = action.payload || 'Échec de la récupération des valeurs uniques.';
        },
      );
  },
});

export default villeSlice.reducer;
