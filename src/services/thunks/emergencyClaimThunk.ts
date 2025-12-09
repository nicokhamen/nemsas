import { createAsyncThunk } from "@reduxjs/toolkit";

import axiosInstance from "../../config/axiosInstance";
import type {
  EmergencyClaimRequest,
  EmergencyClaimResponse,
  CreateEmergencyClaimRequest,
  UpdateEmergencyClaimRequest,
  DeleteEmergencyClaimRequest,
} from "../../types/emergencyClaim";

// Async Thunks
export const fetchEmergencyClaims = createAsyncThunk(
  "emergencyClaim/fetchAll",
  async (
    { providerId, SSHIAId }: EmergencyClaimRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get<EmergencyClaimResponse>(
        `/emergency-Claim?ProviderId=${providerId}&SSHIAId=${SSHIAId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch emergency claims"
      );
    }
  }
);

export const createEmergencyClaim = createAsyncThunk(
  "emergencyClaim/create",
  async (claimData: CreateEmergencyClaimRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<EmergencyClaimResponse>(
        "/emergency-Claim",
        claimData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create emergency claim"
      );
    }
  }
);

export const updateEmergencyClaim = createAsyncThunk(
  "emergencyClaim/update",
  async (
    { id, ...updateData }: UpdateEmergencyClaimRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put<EmergencyClaimResponse>(
        `/emergency-Claim/${id}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update emergency claim"
      );
    }
  }
);

export const deleteEmergencyClaim = createAsyncThunk(
  "emergencyClaim/delete",
  async (
    { id, providerId, SSHIAId }: DeleteEmergencyClaimRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.delete<EmergencyClaimResponse>(
        `/emergency-Claim/${id}?ProviderId=${providerId}&SSHIAId=${SSHIAId}`
      );
      return { ...response.data, deletedId: id };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete emergency claim"
      );
    }
  }
);
