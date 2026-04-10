import { createSlice } from "@reduxjs/toolkit";
import { fetchBanks } from "../thunks/bankThunk";
import type { BankType } from "../../types/bankType";

type BankState = {
  banks: BankType[];
  loading: boolean;
  error: string | null;
};

const initialState: BankState = {
  banks: [],
  loading: false,
  error: null,
};

const bankSlice = createSlice({
  name: "banks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = action.payload.data;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default bankSlice.reducer;