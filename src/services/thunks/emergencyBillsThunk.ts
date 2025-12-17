import { createAsyncThunk } from '@reduxjs/toolkit';
import type { EmergencyBill, EmergencyBillResponse, EmergencyBillsResponse } from '../../types/emergency-bills';
import axiosInstance from '../../config/axiosInstance';

// Thunk to fetch emergency bills by providerId
export const fetchEmergencyBills = createAsyncThunk<
  EmergencyBill[],            
  { providerId: string },     
  { rejectValue: string }
>(
  'emergencyBills/fetchAll',
  async ({ providerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EmergencyBillsResponse>(
        '/emergency-bill',
        {
          params: {
            ProviderId: providerId,
          },
        }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message || 'Failed to fetch emergency bills'
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'An error occurred while fetching emergency bills'
      );
    }
  }
);

// emergencyBillDetailsThunk.ts
export const fetchEmergencyBillDetails = createAsyncThunk<
  EmergencyBill,                
  { 
    emergencyBillId: string;   
    providerId: string;         
  },     
  { rejectValue: string }
>(
  'emergencyBills/fetchDetails',
  async ({ emergencyBillId, providerId }, { rejectWithValue }) => {
    try {
      // Use template literal to construct the URL with both IDs
      const response = await axiosInstance.get<EmergencyBillResponse>(
        `/emergency-bill/${emergencyBillId}/${providerId}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message || 'Failed to fetch emergency bill details'
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'An error occurred while fetching emergency bill details'
      );
    }
  }
);
