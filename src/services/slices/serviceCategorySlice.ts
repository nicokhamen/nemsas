import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ServiceCategoryState, ServiceCategoryResponse } from '../../types/emergency-bill';
import { fetchServiceCategories } from '../thunks/emergencyBillThunk';

const initialState: ServiceCategoryState = {
  categories: [], 
  loading: false,
  error: null,
  lastFetched: null,
  hasFetched: false,
};

const serviceCategorySlice = createSlice({
  name: 'serviceCategories',
  initialState,
  reducers: {
    clearServiceCategoriesError: (state) => {
      state.error = null;
    },
    resetServiceCategories: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action: PayloadAction<ServiceCategoryResponse>) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.lastFetched = new Date().toISOString();
        state.hasFetched = true;
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch service categories';
        state.hasFetched = true;
      });
  },
});

export const { clearServiceCategoriesError, resetServiceCategories } = serviceCategorySlice.actions;
export default serviceCategorySlice.reducer;