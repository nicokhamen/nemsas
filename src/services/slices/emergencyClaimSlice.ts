import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  createEmergencyClaim,
  deleteEmergencyClaim,
  fetchEmergencyClaims,
  updateEmergencyClaim,
} from "../thunks/emergencyClaimThunk";
import type { EmergencyClaim } from "../../types/emergencyClaim";

interface EmergencyClaimState {
  claims: EmergencyClaim[];
  loading: boolean;
  error: string | null;
  currentClaim: EmergencyClaim | null;
  successMessage: string | null;
}

const initialState: EmergencyClaimState = {
  claims: [],
  loading: false,
  error: null,
  currentClaim: null,
  successMessage: null,
};

const emergencyClaimSlice = createSlice({
  name: "emergencyClaim",
  initialState,
  reducers: {
    setCurrentClaim: (state, action: PayloadAction<EmergencyClaim | null>) => {
      state.currentClaim = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetEmergencyClaims: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all claims
      .addCase(fetchEmergencyClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmergencyClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.claims = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchEmergencyClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create claim
      .addCase(createEmergencyClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmergencyClaim.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data && action.payload.data.length > 0) {
          state.claims.unshift(action.payload.data[0]);
        }
        state.successMessage = action.payload.message;
      })
      .addCase(createEmergencyClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update claim
      .addCase(updateEmergencyClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmergencyClaim.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data && action.payload.data.length > 0) {
          const updatedClaim = action.payload.data[0];
          const index = state.claims.findIndex(
            (claim) => claim.id === updatedClaim.id
          );
          if (index !== -1) {
            state.claims[index] = updatedClaim;
          }
        }
        state.successMessage = action.payload.message;
      })
      .addCase(updateEmergencyClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete claim
      .addCase(deleteEmergencyClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmergencyClaim.fulfilled, (state, action: any) => {
        state.loading = false;
        state.claims = state.claims.filter(
          (claim) => claim.id !== action.payload.deletedId
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteEmergencyClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentClaim,
  clearError,
  clearSuccessMessage,
  resetEmergencyClaims,
} = emergencyClaimSlice.actions;

export default emergencyClaimSlice.reducer;
