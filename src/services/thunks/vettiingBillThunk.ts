import { createAsyncThunk } from "@reduxjs/toolkit";
import type { SubmitVettingBillPayload, VettingBillResponse } from "../../types/mdRequest";
import axiosInstance from "../../config/axiosInstance";

export const disputeRejectBill = createAsyncThunk<
  VettingBillResponse,
  SubmitVettingBillPayload,
  { rejectValue: string }
>(
  "vettingClaim/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { emergencyBillId, providerId, ...vettingData } = payload;

      const response = await axiosInstance.put(
        `/emergency-bill/vetting/${emergencyBillId}/${providerId}`,
        {
          emergencyBillId, 
          ...vettingData,
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  }
);