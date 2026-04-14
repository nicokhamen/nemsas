import { createSlice } from "@reduxjs/toolkit";
import { serviceVettingThunk } from "../thunks/serviceVettingThunk";

type ServiceVettingState = {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: any; // replace with your API response type if available
};

const initialState: ServiceVettingState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

const serviceVettingSlice = createSlice({
  name: "serviceVetting",
  initialState,
  reducers: {
    resetServiceVettingState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(serviceVettingThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(serviceVettingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(serviceVettingThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Request failed";
      });
  },
});

export const { resetServiceVettingState } = serviceVettingSlice.actions;

export default serviceVettingSlice.reducer;