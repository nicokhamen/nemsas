import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { ClaimEmergencyBills } from '../../types/ClaimEmergencyBills';


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