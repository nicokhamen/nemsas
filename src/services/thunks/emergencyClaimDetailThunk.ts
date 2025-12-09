import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { EmergencyClaimDetailRequest,EmergencyClaimDetailResponse } from '../../types/emergencyClaimDetail';

// Async Thunk for fetching emergency claim details
export const fetchEmergencyClaimDetail = createAsyncThunk(
  'emergencyClaimDetail/fetchById',
  async ({ id }: EmergencyClaimDetailRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EmergencyClaimDetailResponse>(
        `/emergency-Claim/${id}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch emergency claim details'
      );
    }
  }
);

// Optional: Thunk for updating claim status
export const updateEmergencyClaimStatus = createAsyncThunk(
  'emergencyClaimDetail/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<EmergencyClaimDetailResponse>(
        `/emergency-Claim/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update claim status'
      );
    }
  }
);

// Optional: Thunk for creating a new emergency claim
export const createEmergencyClaim = createAsyncThunk(
  'emergencyClaimDetail/create',
  async (claimData: Omit<EmergencyClaimDetailResponse['data'], 'id' | 'createdDate' | 'isActive' | 'status' | 'vettedAmount' | 'vettedDate'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<EmergencyClaimDetailResponse>(
        '/emergency-Claim',
        claimData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to create emergency claim'
      );
    }
  }
);

// Optional: Thunk for deleting an emergency claim
export const deleteEmergencyClaim = createAsyncThunk(
  'emergencyClaimDetail/delete',
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<EmergencyClaimDetailResponse>(
        `/emergency-Claim/${id}`
      );
      return { ...response.data, deletedId: id };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete emergency claim'
      );
    }
  }
);