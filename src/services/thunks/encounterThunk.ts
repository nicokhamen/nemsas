import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import axiosInstance from '../../config/axiosInstance';
import type { EncounterFormData, EncounterResponse, ApiError } from '../../types/encounter';

export const createEncounter = createAsyncThunk<
  EncounterResponse,
  EncounterFormData,
  { rejectValue: ApiError }
>(
  'encounter/createEncounter',
  async (encounterData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<EncounterResponse>(
        '/emergency-bill', 
        encounterData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response) {
        // Server responded with error status
        return rejectWithValue({
          message: axiosError.response.data.message || 'An error occurred',
          status: axiosError.response.status,
          errors: axiosError.response.data.errors,
        });
      } else if (axiosError.request) {
        // Request made but no response
        return rejectWithValue({
          message: 'No response received from server',
        });
      } else {
        // Something else happened
        return rejectWithValue({
          message: axiosError.message || 'Failed to create encounter',
        });
      }
    }
  }
);