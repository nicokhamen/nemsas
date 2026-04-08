import { createSlice } from "@reduxjs/toolkit";
import type { Claim } from "../../types/claimTrackingType";
import { fetchClaimsTracking } from "../thunks/claimTrackingThunk";


interface ClaimTrackingState {
  data: Claim[];
  loading: boolean;
  error: string | null;
  message: string | null;
  isSuccess: boolean;
}

const initialState: ClaimTrackingState = {
  data: [],
  loading: false,
  error: null,
  message: null,
  isSuccess: false,
};

const claimTrackingSlice = createSlice({
  name: "claimTracking",
  initialState,
  reducers: {
    // optional reset if needed
    resetClaimTrackingState: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClaimsTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClaimsTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.message = action.payload.message;
        state.isSuccess = action.payload.isSuccess;
      })
      .addCase(fetchClaimsTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch claims tracking";
        state.isSuccess = false;
      });
  },
});

export const { resetClaimTrackingState } = claimTrackingSlice.actions;

export default claimTrackingSlice.reducer;