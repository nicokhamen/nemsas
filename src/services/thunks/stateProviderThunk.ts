import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { CreateProviderPayload, GetProvidersResponse } from "../../types/stateProvider";


export const createProvider = createAsyncThunk(
  "providers/createProvider",
  async (payload: CreateProviderPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/providers", payload);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create provider"
      );
    }
  }
);

export const getProviders = createAsyncThunk<GetProvidersResponse>(
  "providers/getProviders",
  async () => {
    const res = await axiosInstance.get("/providers/all");
    return res.data;
  }
);