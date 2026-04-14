import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { ServiceVetting } from "../../types/serviceVetting";


// Thunk
export const serviceVettingThunk = createAsyncThunk<

  any,
  // Argument type
  ServiceVetting,
  // Optional thunk config (for error typing)
  {
    rejectValue: string;
  }
>(
  "emergencyBill/serviceVetting",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/emergency-bill/service-vetting",
        payload
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  }
);