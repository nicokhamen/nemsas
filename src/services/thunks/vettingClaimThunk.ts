import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { VettingClaim, VettingClaimResponse } from "../../types/mdRequest";

export interface SubmitVettingClaimPayload extends VettingClaim {
  claimId: string;
  providerId: string;
}

// export const submitVettingClaim = createAsyncThunk<
//   VettingClaimResponse, 
//   SubmitVettingClaimPayload, 
//   { rejectValue: string }
// >("vettingClaim/submit", async (payload, { rejectWithValue }) => {
//   try {
//     const { claimId, ...vettingData } = payload;

//     // Use the claimId in the URL
//     // const response = await axiosInstance.put(
//     //   `/emergency-claim/vetting/${claimId}`,
//     //   vettingData
//     // );
//     const response = await axiosInstance.put(
//       `/emergency-claim/vetting/${claimId}/${payload.providerId}`,
//       vettingData,
//     );

//     return response.data;
//   } catch (error: any) {
//     return rejectWithValue(
//       error?.response?.data?.message || "Something went wrong",
//     );
//   }
// });
export const submitVettingClaim = createAsyncThunk<
  VettingClaimResponse,
  SubmitVettingClaimPayload,
  { rejectValue: string }
>(
  "vettingClaim/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { claimId, providerId, ...vettingData } = payload;

      const response = await axiosInstance.put(
        `/emergency-claim/vetting/${claimId}/${providerId}`,
        vettingData
      );

      return response.data;
    } catch (error: any) {
      // Backend sometimes returns RFC7807-like payloads with `title` instead of `message`.
      return rejectWithValue(
        error?.response?.data?.title ||
          error?.response?.data?.message ||
          "Something went wrong"
      );
    }
  }
);
