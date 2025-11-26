import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import { registerPatient } from '../thunks/patientThunk';
import type { PatientRegistrationState, PatientRegistrationResponse } from '../../types/patient';

const initialState: PatientRegistrationState = {
  loading: false,
  success: false,
  error: null,
  patientData: null,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearPatientState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.patientData = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        registerPatient.fulfilled,
        (state, action: PayloadAction<PatientRegistrationResponse>) => {
          state.loading = false;
          state.success = true;
          state.patientData = action.payload;
          state.error = null;
        }
      )
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Registration failed';
        state.patientData = null;
      });
  },
});

export const { clearPatientState, resetSuccess } = patientSlice.actions;
export default patientSlice.reducer;