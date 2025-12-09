// patientSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { registerPatient } from '../thunks/patientThunk';
import type { PatientRegistrationState, PatientRegistrationResponse } from '../../types/patient';

const initialState: PatientRegistrationState = {
  loading: false,
  success: false,
  error: null,
  patientData: null,
  registeredPatientId: null,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearPatientState: (state, action: PayloadAction<{ clearId?: boolean }>) => {
      state.patientData = null;
      state.loading = false;
      state.success = false;
      state.error = null;
      if (action.payload?.clearId) {
        state.registeredPatientId = null;
      }
    },
    setRegisteredPatientId: (state, action: PayloadAction<string>) => {
      state.registeredPatientId = action.payload;
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
          
          // Extract patient ID from the nested data structure
          if (action.payload.data && action.payload.data.id) {
            state.registeredPatientId = action.payload.data.id;
            console.log("Redux slice - Set registeredPatientId:", action.payload.data.id);
          } else {
            console.warn("No patient ID found in response data:", action.payload);
            state.registeredPatientId = null;
          }
        }
      )
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Registration failed';
        state.patientData = null;
        state.registeredPatientId = null;
      });
  },
});

export const { clearPatientState, resetSuccess, setRegisteredPatientId } = patientSlice.actions;
export default patientSlice.reducer;