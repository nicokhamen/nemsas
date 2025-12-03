import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchICDCodes } from '../thunks/icdThunk';
import type { ICDState, ICDResponse } from '../../types/emergency-bill';

// Initial state
const initialState: ICDState = {
  data: [],
  message: '',
  isSuccess: false,
  loading: false,
  error: null,
};

const icdSlice = createSlice({
  name: 'icd',
  initialState,
  reducers: {
    // Optional: Clear ICD data
    clearICDData: (state) => {
      state.data = [];
      state.message = '';
      state.isSuccess = false;
      state.error = null;
    },
    
    // Optional: Reset loading and error states
    resetICDState: (state) => {
      state.loading = false;
      state.error = null;
    },
    
    // Optional: Set a custom message
    setICDMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchICDCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSuccess = false;
        state.message = 'Loading ICD codes...';
      })
      
      // Handle fulfilled state
      .addCase(fetchICDCodes.fulfilled, (state, action: PayloadAction<ICDResponse>) => {
        state.loading = false;
        state.isSuccess = action.payload.isSuccess;
        state.message = action.payload.message;
        state.data = action.payload.data;
        state.error = null;
        
        // If no data returned, set empty array
        if (!action.payload.data) {
          state.data = [];
        }
      })
      
      // Handle rejected state
      .addCase(fetchICDCodes.rejected, (state, action) => {
        state.loading = false;
        state.isSuccess = false;
        state.error = action.payload || 'Failed to fetch ICD codes';
        state.message = action.payload || 'Failed to fetch ICD codes';
        state.data = [];
      });
  },
});

// Export actions
export const { clearICDData, resetICDState, setICDMessage } = icdSlice.actions;

// Export reducer
export default icdSlice.reducer;