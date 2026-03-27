import { createAsyncThunk } from '@reduxjs/toolkit';

import axiosInstance from '../../config/axiosInstance';
import type { HospitalResponse } from '../../types/updateProvider';

interface ActivateProviderParams {
  providerId: string;
  data?: any; 
}

export const activateProvider = createAsyncThunk<
  HospitalResponse,
  ActivateProviderParams,
  { rejectValue: string }
>(
  'providers/activate',
  async ({ providerId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<HospitalResponse>(
        `providers/${providerId}/activate`,
        data || {} // Send empty object if no data provided
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to activate provider';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deactivateProvider = createAsyncThunk<
  HospitalResponse,
  ActivateProviderParams,
  { rejectValue: string }
>(
  'providers/deactivate',
  async ({ providerId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<HospitalResponse>(
        `providers/${providerId}/deactivate`,
        data || {} 
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deactivate provider';
      return rejectWithValue(errorMessage);
    }
  }
);