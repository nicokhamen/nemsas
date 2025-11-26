import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { NemsasClaimsQueryParams, NemasaClaimsResponse, NemsasClaim } from '../../types/nemsas';

// ============
export const fetchClaims = createAsyncThunk(
  'claims/fetchClaims',
  async (queryParams: NemsasClaimsQueryParams, { rejectWithValue }) => {
    try {
     
      const params = {
        ...queryParams,
        IsExcel: false 
      };

      const response = await axiosInstance.get<NemasaClaimsResponse>('/nemsas-claims/all-claims', { 
        params 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch claims');
    }
  }
);

// Fetch single claim by ID
export const fetchClaimById = createAsyncThunk(
  'claims/fetchClaimById',
  async (claimId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<NemsasClaim>(`/api/claims/${claimId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch claim');
    }
  }
);

// Create new claim
export const createClaim = createAsyncThunk(
  'claims/createClaim',
  async (claimData: Omit<NemsasClaim, 'id' | 'submittedAt'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<NemsasClaim>('/api/claims', claimData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create claim');
    }
  }
);

// Update claim
export const updateClaim = createAsyncThunk(
  'claims/updateClaim',
  async ({ id, claimData }: { id: string; claimData: Partial<NemsasClaim> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<NemsasClaim>(`/api/claims/${id}`, claimData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update claim');
    }
  }
);

// Delete claim
export const deleteClaim = createAsyncThunk(
  'claims/deleteClaim',
  async (claimId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/claims/${claimId}`);
      return claimId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete claim');
    }
  }
);