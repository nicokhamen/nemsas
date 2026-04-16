import { createAsyncThunk } from "@reduxjs/toolkit";
import type { NhiaApproved } from "../../types/nhiaApproved";
import axiosInstance from "../../config/axiosInstance";

//  GET NHIA APPROVED PROVIDERS (WITH SEARCH)
export const fetchNhiaApprovedProviders = createAsyncThunk<
  NhiaApproved,     // Return type
  string,           // Argument type (search string)
  { rejectValue: string }
>(
  "nhiaApproved/fetchProviders",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<NhiaApproved>(
        `/providers/nhia-approved`,
        {
          params: {
            search: searchTerm, 
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch NHIA approved providers";

      return rejectWithValue(message);
    }
  }
);