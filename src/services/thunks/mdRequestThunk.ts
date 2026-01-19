import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { mdVetRequest, ApiResponse } from '../../types/mdRequest';


export const mdVetEmergencyClaim = createAsyncThunk<
  ApiResponse<boolean>,            // fulfilled return type
  mdVetRequest,        // argument type
  { rejectValue: string }          // rejected payload type
>(
  'emergencyVetting/vetEmergencyClaim',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<boolean>>(
        '/emergency-bill/vetting',
        payload
      );

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ??
        error?.message ??
        'Failed to vet emergency claim'
      );
    }
  }
);
