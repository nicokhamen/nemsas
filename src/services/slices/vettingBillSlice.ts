import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { disputeRejectBill } from "../thunks/vettiingBillThunk";
import type { VettingBillResponse } from "../../types/mdRequest";

interface VettingBillState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: VettingBillResponse | null;
}

const initialState: VettingBillState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

const vettingBillSlice = createSlice({
  name: "vettingBill",
  initialState,
  reducers: {
    resetVettingBillState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //  Pending
      .addCase(disputeRejectBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      //  Fulfilled
      .addCase(
        disputeRejectBill.fulfilled,
        (state, action: PayloadAction<VettingBillResponse>) => {
          state.loading = false;
          state.success = true;
          state.data = action.payload;
        }
      )

      //  Rejected
      .addCase(disputeRejectBill.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to process request";
      });
  },
});

export const { resetVettingBillState } = vettingBillSlice.actions;

export default vettingBillSlice.reducer;