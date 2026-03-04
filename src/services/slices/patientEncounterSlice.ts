// services/slices/patientEncounterSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchPatientEncounter } from '../thunks/patientEncounterThunk';
import type { EmergencyBill } from '../../types/PatientsEncounter';
// import { EmergencyBill } from '../../types/emergencyBill.types';

interface PatientEncounterState {
  data: EmergencyBill[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: PatientEncounterState = {
  data: null,
  loading: false,
  error: null,
};

const patientEncounterSlice = createSlice({
  name: 'patientEncounter',
  initialState,
  reducers: {
    clearPatientEncounter: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientEncounter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientEncounter.fulfilled, (state, action: PayloadAction<EmergencyBill[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchPatientEncounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch patient encounters';
        state.data = null;
      });
  },
});

export const { clearPatientEncounter } = patientEncounterSlice.actions;
export default patientEncounterSlice.reducer;