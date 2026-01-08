import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { PatientData } from '../../types/patient';

// Response interfaces matching your schema
export interface GetAllPatientsResponse {
  data: PatientData[];
  message: string;
  isSuccess: boolean;
}

export interface RegisterPatientResponse {
  data: PatientData;
  message: string;
  isSuccess: boolean;
}

// Register Patient
export const registerPatient = createAsyncThunk<
  RegisterPatientResponse,
  PatientData, // Using PatientData since your schema matches
  { rejectValue: string }
>(
  'patient/register',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<RegisterPatientResponse>(
        '/patient', 
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

// Get All Patients
export const getAllPatients = createAsyncThunk<
  GetAllPatientsResponse,
  string, // providerId parameter
  { rejectValue: string }
>(
  'patients/getAll',
  async (providerId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<GetAllPatientsResponse>('/patient', {
        params: {
          ProviderId: providerId // Note: Capital 'P' according to your URL
        }
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patients'
      );
    }
  }
);