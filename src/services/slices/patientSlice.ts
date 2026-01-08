// patientSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { registerPatient, getAllPatients } from '../thunks/patientThunk';
import type { 
  PatientData,

} from '../../types/patient';

interface PatientState {
  // Registration state
  loading: boolean;
  success: boolean;
  error: string | null;
  patientData: PatientData | null;
  registeredPatientId: string | null;
  
  // List state
  patientsList: PatientData[];
  patientsLoading: boolean;
  patientsError: string | null;
}

const initialState: PatientState = {
  // Registration
  loading: false,
  success: false,
  error: null,
  patientData: null,
  registeredPatientId: null,
  
  // List
  patientsList: [],
  patientsLoading: false,
  patientsError: null,
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
      state.registeredPatientId = null;
    },
    clearPatientsList: (state) => {
      state.patientsList = [];
      state.patientsError = null;
    },
  },
  extraReducers: (builder) => {
    // Register Patient
    builder
      .addCase(registerPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.patientData = action.payload.data;
        state.registeredPatientId = action.payload.data.id;
        state.error = null;
        
        // Add new patient to list
        state.patientsList.unshift(action.payload.data);
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Registration failed';
        state.patientData = null;
        state.registeredPatientId = null;
      });
    
    // Get All Patients
    builder
      .addCase(getAllPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(getAllPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patientsList = action.payload.data;
        state.patientsError = null;
      })
      .addCase(getAllPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload || 'Failed to fetch patients';
        state.patientsList = [];
      });
  },
});

export const { clearPatientState, clearPatientsList } = patientSlice.actions;
export default patientSlice.reducer;