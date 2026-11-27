import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { PaysResponse } from './pays-schemas';

interface PaysState {
  pays: PaysResponse | null;
  allPays: PaysResponse[];
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

const initialState: PaysState = {
  pays: null,
  allPays: [],
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
    >(`${API_BASE_URL}/api/pays/unique-values`, { columnNames });
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        `Échec de la récupération des valeurs uniques pour la colonne ${columnNames}.`,
    );
  }
});

export const getAllPays = createAsyncThunk<
  { items: PaysResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('pays/getAllPays', async (params, { rejectWithValue }) => {
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
      items: PaysResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/pays?${urlParams.toString()}`);

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la récupération des pays.',
    );
  }
});

const paysSlice = createSlice({
  name: 'pays',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllPays.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPays.fulfilled, (state, action) => {
        state.loading = false;
        state.allPays = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllPays.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des pays.';
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

export default paysSlice.reducer;
