import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { EncounterResponse, ApiError } from '../../types/encounter';
import { createEncounter } from '../thunks/departmentThunk';

interface EncounterState {
  data: EncounterResponse | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

const initialState: EncounterState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

const encounterSlice = createSlice({
  name: 'encounter',
  initialState,
  reducers: {
    // Reset state if needed
    resetEncounterState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(createEncounter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      // Handle fulfilled state
      .addCase(
        createEncounter.fulfilled,
        (state, action: PayloadAction<EncounterResponse>) => {
          state.loading = false;
          state.data = action.payload;
          state.success = true;
          state.error = null;
        }
      )
      // Handle rejected state
      .addCase(
        createEncounter.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;
          state.error = action.payload || {
            message: 'An unknown error occurred',
          };
        }
      );
  },
});

// Export actions
export const { resetEncounterState, clearError } = encounterSlice.actions;

// Export reducer
export default encounterSlice.reducer;