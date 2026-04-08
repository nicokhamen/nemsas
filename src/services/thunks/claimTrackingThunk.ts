import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ClaimsResponse } from "../../types/claimTrackingType";
import axiosInstance from "../../config/axiosInstance";


// Thunk to fetch claims tracking data
export const fetchClaimsTracking = createAsyncThunk<
  ClaimsResponse, // return type
  void,           // argument type
  { rejectValue: string }
>(
  "claims/fetchTracking",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ClaimsResponse>(
        "/emergency-claim/tracking"
      );

      // Optional: check API success flag
      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Request failed");
      }

      return response.data;
    } catch (error: any) {
      // Handle Axios errors safely
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      return rejectWithValue(message);
    }
  }
);