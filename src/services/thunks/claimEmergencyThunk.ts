import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type {
  ClaimEmergencyBills,
  EmergencyClaimBillsResponse,
} from '../../types/ClaimEmergencyBills';


interface FetchEmergencyBillsParams {
  emergencyClaimId: string;
  providerId: string;
}

export const fetchClaimsEmergencyBills = createAsyncThunk<
  ClaimEmergencyBills, 
  FetchEmergencyBillsParams, 
  { rejectValue: string } 
>(
  'emergencyBills/fetchEmergencyBills',
  async ({ emergencyClaimId, providerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ClaimEmergencyBills>('/emergency-bill', {
        params: {
          EmergencyClaimId: emergencyClaimId,
          ProviderId: providerId
        }
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch emergency bills');
      }
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchEmergencyClaimBillsByClaimNumber = createAsyncThunk<
  ClaimEmergencyBills,
  { claimNumber: string },
  { rejectValue: string }
>(
  'emergencyClaims/fetchBillsByClaimNumber',
  async ({ claimNumber }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EmergencyClaimBillsResponse>(
        '/emergency-claim/bills',
        {
          params: {
            ClaimNumber: claimNumber,
          },
        },
      );

      return {
        data: response.data.data?.bills || [],
        message: response.data.message,
        isSuccess: response.data.isSuccess,
        claimDetails: response.data.data,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(
          error.response.data.message || 'Failed to fetch claim bills',
        );
      }

      return rejectWithValue(error.message || 'An error occurred');
    }
  },
);
