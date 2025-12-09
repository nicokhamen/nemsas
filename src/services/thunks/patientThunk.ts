import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { PatientRegistrationResponse, PatientRegistrationData } from '../../types/patient';

export const registerPatient = createAsyncThunk<
  PatientRegistrationResponse,
  Omit<PatientRegistrationData, 'providerId'> & { providerId?: string },
  { rejectValue: string }
>(
  'patient/register',
  async (patientData, { rejectWithValue }) => {
    try {
       console.log("Sending patient registration request...");
      const response = await axiosInstance.post<PatientRegistrationResponse>(
        '/patient', 
        patientData
      );
       console.log("Patient registration response:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register patient'
      );
    }
  }
);