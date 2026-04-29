import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import type { EmergencyBillServiceResponse, EmergencyBillServiceRequest } from "../../types/emergencyBillService";


export const updateEmergencyBillService = createAsyncThunk<
  EmergencyBillServiceResponse,
  EmergencyBillServiceRequest,
  { rejectValue: string }
>(
  "emergencyBill/updateService",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/emergency-bill/services/${payload.id}`,
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

export const deleteEmergencyBillService = createAsyncThunk<
  EmergencyBillServiceResponse, // return type
  string,                       // argument type (id)
  { rejectValue: string }
>(
  "emergencyBillService/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/emergency-bill/services/${id}`
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete service"
      );
    }
  }
);
