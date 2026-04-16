import { createSlice } from "@reduxjs/toolkit";
import type { NhiaApprovedItem } from "../../types/nhiaApproved";
import { fetchNhiaApprovedProviders } from "../thunks/nhiaApprovedThunk";

interface NhiaApprovedState {
  data: NhiaApprovedItem[];
  loading: boolean;
  error: string | null;
  message: string;
}

const initialState: NhiaApprovedState = {
  data: [],
  loading: false,
  error: null,
  message: "",
};

const nhiaApprovedSlice = createSlice({
  name: "nhiaApproved",
  initialState,
  reducers: {
    clearNhiaApproved: (state) => {
      state.data = [];
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchNhiaApprovedProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Success
      .addCase(fetchNhiaApprovedProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })

      // Failure
      .addCase(fetchNhiaApprovedProviders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch NHIA approved providers";
      });
  },
});

export const { clearNhiaApproved } = nhiaApprovedSlice.actions;

export default nhiaApprovedSlice.reducer;