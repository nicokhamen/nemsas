import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { mdVetRequest, ApiResponse } from '../../types/mdRequest';

interface mdVetPayload extends mdVetRequest {
  claimId: string;
}

export const mdVetEmergencyClaim = createAsyncThunk<
  ApiResponse<boolean>,            // fulfilled return type
  mdVetPayload,                    // argument type
  { rejectValue: string }          // rejected payload type
>(
  'emergencyVetting/vetEmergencyClaim',
  async (payload, { rejectWithValue }) => {
    try {
      const { claimId, ...vettingPayload } = payload;
      const response = await axiosInstance.put<ApiResponse<boolean>>(
        `/api/v1/emergency-bill/vetting/${claimId}`,
        vettingPayload
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
