// emergency-bills.slice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { EmergencyBillState } from "../../types/emergency-bills";
import {
  fetchEmergencyBills,
  fetchEmergencyBillDetails,
  updateEmergencyBill,
  deleteEmergencyBill,
} from "../thunks/emergencyBillsThunk";

const initialState: EmergencyBillState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
  lastFetched: null,
  hasFetched: false,
};

const emergencyBillsSlice = createSlice({
  name: "emergencyBills",
  initialState,
  reducers: {
    setCurrentBill(state, action) {
      state.currentBill = action.payload;
    },
    clearCurrentBill(state) {
      state.currentBill = null;
    },
    clearError(state) {
      state.error = null;
    },
    // Optional: Add a reducer to remove a bill from the list
    removeBillFromList(state, action) {
      state.bills = state.bills.filter((bill) => bill.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchEmergencyBills
      .addCase(fetchEmergencyBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmergencyBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
        state.hasFetched = true;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchEmergencyBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch emergency bills";
      })

      // Handle fetchEmergencyBillDetails
      .addCase(fetchEmergencyBillDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmergencyBillDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchEmergencyBillDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to fetch emergency bill details";
        state.currentBill = null;
      })

      // Handle updateEmergencyBill
      .addCase(updateEmergencyBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmergencyBill.fulfilled, (state, action) => {
        state.loading = false;

        // Update the current bill if it's the one being edited
        if (state.currentBill?.id === action.payload.id) {
          state.currentBill = action.payload;
        }

        // Update the bill in the bills array if it exists
        const billIndex = state.bills.findIndex(
          (bill) => bill.id === action.payload.id
        );
        if (billIndex !== -1) {
          state.bills[billIndex] = action.payload;
        }

        state.error = null;
      })
      .addCase(updateEmergencyBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update emergency bill";
      })

      // Handle deleteEmergencyBill
      .addCase(deleteEmergencyBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmergencyBill.fulfilled, (state, action) => {
        state.loading = false;

        // Remove the deleted bill from the bills array
        state.bills = state.bills.filter(
          (bill) => bill.id !== action.payload.emergencyBillId
        );

        // Clear current bill if it was the one deleted
        if (state.currentBill?.id === action.payload.emergencyBillId) {
          state.currentBill = null;
        }

        state.error = null;
      })
      .addCase(deleteEmergencyBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete emergency bill";
      });
  },
});

export const {
  setCurrentBill,
  clearCurrentBill,
  clearError,
  removeBillFromList,
} = emergencyBillsSlice.actions;

export default emergencyBillsSlice.reducer;
