import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { EmergencyClaimDetail } from '../../types/emergencyClaimDetail';
import { fetchEmergencyClaimDetail, updateEmergencyClaimStatus, createEmergencyClaim, deleteEmergencyClaim } from '../thunks/emergencyClaimDetailThunk';


interface EmergencyClaimDetailState {
  claim: EmergencyClaimDetail | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isSuccess: boolean;
}

const initialState: EmergencyClaimDetailState = {
  claim: null,
  loading: false,
  error: null,
  successMessage: null,
  isSuccess: false
};

const emergencyClaimDetailSlice = createSlice({
  name: 'emergencyClaimDetail',
  initialState,
  reducers: {
    // Clear the current claim details
    clearEmergencyClaimDetail: (state) => {
      state.claim = null;
      state.error = null;
      state.successMessage = null;
      state.isSuccess = false;
    },
    
    // Manually set claim (useful for caching or pre-loading)
    setEmergencyClaimDetail: (state, action: PayloadAction<EmergencyClaimDetail>) => {
      state.claim = action.payload;
      state.error = null;
    },
    
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Reset to initial state
    resetEmergencyClaimDetail: () => initialState,
    
    // Manually update claim status (for optimistic updates)
    updateClaimStatusLocally: (state, action: PayloadAction<string>) => {
      if (state.claim) {
        state.claim.status = action.payload as any;
      }
    },
    
    // Manually update vetted amount
    updateVettedAmountLocally: (state, action: PayloadAction<number>) => {
      if (state.claim) {
        state.claim.vettedAmount = action.payload;
        state.claim.vettedDate = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch claim details
      .addCase(fetchEmergencyClaimDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.isSuccess = false;
      })
      .addCase(fetchEmergencyClaimDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.claim = action.payload.data;
        state.successMessage = action.payload.message;
        state.isSuccess = action.payload.isSuccess;
      })
      .addCase(fetchEmergencyClaimDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.claim = null;
        state.isSuccess = false;
      })
      
      // Update claim status
      .addCase(updateEmergencyClaimStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmergencyClaimStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.claim = action.payload.data;
        state.successMessage = action.payload.message;
        state.isSuccess = action.payload.isSuccess;
      })
      .addCase(updateEmergencyClaimStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create emergency claim
      .addCase(createEmergencyClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmergencyClaim.fulfilled, (state, action) => {
        state.loading = false;
        state.claim = action.payload.data;
        state.successMessage = action.payload.message;
        state.isSuccess = action.payload.isSuccess;
      })
      .addCase(createEmergencyClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete emergency claim
      .addCase(deleteEmergencyClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmergencyClaim.fulfilled, (state, action: any) => {
        state.loading = false;
        // Clear the claim if it was deleted
        if (state.claim?.id === action.payload.deletedId) {
          state.claim = null;
        }
        state.successMessage = action.payload.message;
        state.isSuccess = action.payload.isSuccess;
      })
      .addCase(deleteEmergencyClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  clearEmergencyClaimDetail,
  setEmergencyClaimDetail,
  clearError,
  clearSuccessMessage,
  resetEmergencyClaimDetail,
  updateClaimStatusLocally,
  updateVettedAmountLocally
} = emergencyClaimDetailSlice.actions;

export default emergencyClaimDetailSlice.reducer;