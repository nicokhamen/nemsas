import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DepartmentState, DepartmentsResponse } from '../../types/emergency-bill';
import { fetchDepartments } from '../thunks/emergencyBillThunk';

const initialState: DepartmentState = {
  departments: [], 
  loading: false,
  error: null,
  lastFetched: null,
  hasFetched: false,
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentsError: (state) => {
      state.error = null;
    },
    resetDepartments: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<DepartmentsResponse>) => {
        state.loading = false;
        state.departments = action.payload.data; // Store array
        state.lastFetched = new Date().toISOString();
        state.hasFetched = true; 
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch departments';
        state.hasFetched = true; 
      });
  },
});

export const { clearDepartmentsError, resetDepartments } = departmentSlice.actions;
export default departmentSlice.reducer;