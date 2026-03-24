import { createSlice } from "@reduxjs/toolkit";
import { submitVettingClaim } from "../thunks/vettingClaimThunk";
interface VettingClaimState {
  loading: boolean;
  data: any;
  error: string | null;
}

const initialState: VettingClaimState = {
  loading: false,
  data: null,
  error: null,
};

const vettingClaimSlice = createSlice({
  name: "vettingClaim",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitVettingClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVettingClaim.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(submitVettingClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Request failed";
      });
  },
});

export default vettingClaimSlice.reducer;