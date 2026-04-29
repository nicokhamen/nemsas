import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { EmergencyBillServiceResponse } from "../../types/emergencyBillService";
import {
  updateEmergencyBillService,
  deleteEmergencyBillService,
} from "../thunks/updateEmergencyBillThunk";

interface EmergencyBillServiceState {
  loading: boolean;
  success: boolean;
  message: string | null;
  error: string | null;
}

const initialState: EmergencyBillServiceState = {
  loading: false,
  success: false,
  message: null,
  error: null,
};

const emergencyBillServiceSlice = createSlice({
  name: "emergencyBillService",
  initialState,
  reducers: {
    resetEmergencyBillServiceState: (state) => {
      state.loading = false;
      state.success = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // UPDATE
    builder
      .addCase(updateEmergencyBillService.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateEmergencyBillService.fulfilled,
        (state, action: PayloadAction<EmergencyBillServiceResponse>) => {
          state.loading = false;
          state.success = action.payload.isSuccess;
          state.message = action.payload.message;
        },
      )
      .addCase(updateEmergencyBillService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Update failed";
        state.success = false;
      });

    // DELETE
    builder
      .addCase(deleteEmergencyBillService.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        deleteEmergencyBillService.fulfilled,
        (state, action: PayloadAction<EmergencyBillServiceResponse>) => {
          state.loading = false;
          state.success = action.payload.isSuccess;
          state.message = action.payload.message;
        },
      )
      .addCase(deleteEmergencyBillService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
        state.success = false;
      });
  },
});

export const { resetEmergencyBillServiceState } =
  emergencyBillServiceSlice.actions;

export default emergencyBillServiceSlice.reducer;
