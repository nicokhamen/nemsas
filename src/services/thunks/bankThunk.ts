import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { BankDataResponse } from "../../types/bankType";

export const fetchBanks = createAsyncThunk<
  BankDataResponse, // return type
  void,             // argument type
  { rejectValue: string }
>("bank/fetchBanks", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<BankDataResponse>(
      "/resources/banks"
    );

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch banks"
    );
  }
});