import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { HospitalData, HospitalResponse } from '../../types/updateProvider';
import { activateProvider, deactivateProvider } from '../thunks/updateProviderStatus';

interface ProviderState {
  currentProvider: HospitalData | null;
  activateLoading: boolean;
  deactivateLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  message: string | null;
}

const initialState: ProviderState = {
  currentProvider: null,
  activateLoading: false,
  deactivateLoading: false,
  error: null,
  isSuccess: false,
  message: null,
};

const providerManagementSlice  = createSlice({
  name: 'providerManagement',
  initialState,
  reducers: {
    clearProviderState: (state) => {
      state.currentProvider = null;
      state.error = null;
      state.isSuccess = false;
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Activate Provider
    builder
      .addCase(activateProvider.pending, (state) => {
        state.activateLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(activateProvider.fulfilled, (state, action: PayloadAction<HospitalResponse>) => {
        state.activateLoading = false;
        state.isSuccess = action.payload.isSuccess;
        state.currentProvider = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(activateProvider.rejected, (state, action) => {
        state.activateLoading = false;
        state.isSuccess = false;
        state.error = action.payload || 'Failed to activate provider';
        state.message = null;
      })
      // Deactivate Provider
      .addCase(deactivateProvider.pending, (state) => {
        state.deactivateLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(deactivateProvider.fulfilled, (state, action: PayloadAction<HospitalResponse>) => {
        state.deactivateLoading = false;
        state.isSuccess = action.payload.isSuccess;
        state.currentProvider = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(deactivateProvider.rejected, (state, action) => {
        state.deactivateLoading = false;
        state.isSuccess = false;
        state.error = action.payload || 'Failed to deactivate provider';
        state.message = null;
      });
  },
});

export const { clearProviderState, clearError } = providerManagementSlice.actions;
export default providerManagementSlice.reducer;