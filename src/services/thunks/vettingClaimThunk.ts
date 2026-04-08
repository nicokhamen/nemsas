import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { VettingClaim, VettingClaimResponse } from "../../types/mdRequest";


export interface SubmitVettingClaimPayload extends VettingClaim {
  claimId: string;  
 
}

export const submitVettingClaim = createAsyncThunk<
  VettingClaimResponse,              // return type
  SubmitVettingClaimPayload,         // argument type
  { rejectValue: string }
>(
  "vettingClaim/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { claimId, ...vettingData } = payload;
      
      // Use the claimId in the URL
      const response = await axiosInstance.put(
        `/emergency-claim/vetting/${claimId}`, 
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

