// emergency-bills.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { EmergencyBillState } from '../../types/emergency-bills';
import { fetchEmergencyBills } from '../thunks/emergencyBillsThunk';

const initialState: EmergencyBillState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
  lastFetched: null,
  hasFetched: false,
};

const emergencyBillsSlice = createSlice({
  name: 'emergencyBills',
  initialState,
  reducers: {
    setCurrentBill(state, action) {
      state.currentBill = action.payload;
    },
    clearCurrentBill(state) {
      state.currentBill = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload ?? 'Failed to fetch emergency bills';
      });
  },
});

export const {
  setCurrentBill,
  clearCurrentBill,
} = emergencyBillsSlice.actions;

export default emergencyBillsSlice.reducer;
