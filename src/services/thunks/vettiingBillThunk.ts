import { createAsyncThunk } from "@reduxjs/toolkit";
import type { SubmitVettingBillPayload, VettingBillResponse } from "../../types/mdRequest";
import axiosInstance from "../../config/axiosInstance";

export const disputeRejectBill = createAsyncThunk<
  VettingBillResponse,              // return type
  SubmitVettingBillPayload,         // argument type
  { rejectValue: string }
>(
  "vettingClaim/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { emergencyBillId, ...vettingData } = payload;
      
      // Use the billId in the URL
      const response = await axiosInstance.put(
        `/emergency-bill/vetting/${emergencyBillId}`, 
        vettingData
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  }
);