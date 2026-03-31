import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { StateResponse } from "../../types/stateTypes";

export const fetchStates = createAsyncThunk<
  StateResponse,   // return type
  void,            // no argument needed
  { rejectValue: string }
>(
  "states/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<StateResponse>(
        "/resources/states/all"
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch states"
      );
    }
  }
);