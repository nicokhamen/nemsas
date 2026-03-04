// services/thunks/patientEncounterThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { EncounterApiResponse } from '../../types/PatientsEncounter';

interface FetchPatientEncounterParams {
  patientId: string;
  providerId: string;
}

export const fetchPatientEncounter = createAsyncThunk(
  'patientEncounter/fetch',
  async ({ patientId, providerId }: FetchPatientEncounterParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EncounterApiResponse>(
        `/emergency-bill?PatientId=${patientId}&ProviderId=${providerId}`
      );
      
      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch patient encounters');
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'An error occurred'
      );
    }
  }
);