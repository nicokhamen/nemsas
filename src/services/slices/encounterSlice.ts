// In your encounter slice file
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
    resetEncounterState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEncounter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createEncounter.fulfilled,
        (state, action: PayloadAction<EncounterResponse>) => {
          state.loading = false;
          state.data = action.payload;
          state.success = true;
          state.error = null;
        }
      )
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

export const { resetEncounterState, clearError } = encounterSlice.actions;
export default encounterSlice.reducer;