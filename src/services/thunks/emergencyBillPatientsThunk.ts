import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { EmergencyBillPatients } from "../../types/emergency-bill-patients";

interface FetchEmergencyBillPatientsParams {
  providerId: string;
  emergencyClaimId: string;
}

export const fetchEmergencyBillPatients = createAsyncThunk<
  EmergencyBillPatients,
  FetchEmergencyBillPatientsParams,
  { rejectValue: string }
>(
  "emergencyBill/fetchPatients",
  async ({ providerId, emergencyClaimId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EmergencyBillPatients>(
        `/emergency-bill/${providerId}/${emergencyClaimId}/patients`
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch emergency bill patients"
      );
    }
  }
);