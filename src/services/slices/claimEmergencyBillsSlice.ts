import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchClaimsEmergencyBills } from '../thunks/claimEmergencyThunk';
import type { ClaimEmergencyBills } from '../../types/ClaimEmergencyBills';

interface ClaimsEmergencyBillsState {
  data: ClaimEmergencyBills | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClaimsEmergencyBillsState = {
  data: null,
  loading: false,
  error: null,
};

const claimsEmergencyBillsSlice = createSlice({
  name: 'claimsEmergencyBills',
  initialState,
  reducers: {
    clearEmergencyBills: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
    clearCurrentEmergencyBills: (state) => {
      state.data = null;
      state.error = null;
      // Note: We don't reset loading here as it should be controlled by the thunk state
    },
    setEmergencyBills: (state, action: PayloadAction<ClaimEmergencyBills>) => {
      state.data = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClaimsEmergencyBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClaimsEmergencyBills.fulfilled, (state, action: PayloadAction<ClaimEmergencyBills>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchClaimsEmergencyBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch emergency bills';
        state.data = null;
      });
  },
});

export const { 
  clearEmergencyBills, 
  clearCurrentEmergencyBills, 
  setEmergencyBills, 
  setError, 
  clearError 
} = claimsEmergencyBillsSlice.actions;

export default claimsEmergencyBillsSlice.reducer;