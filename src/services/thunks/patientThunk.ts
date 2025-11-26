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
      
      const response = await axiosInstance.post<PatientRegistrationResponse>(
        '/patient', // Adjust the endpoint as needed
        patientData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register patient'
      );
    }
  }
);