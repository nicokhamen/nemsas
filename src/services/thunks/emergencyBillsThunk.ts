import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  EmergencyBill,
  EmergencyBillResponse,
  EmergencyBillsResponse,
  UpdateEmergencyBill as UpdateEmergencyBillType,
} from "../../types/emergency-bills";
import axiosInstance from "../../config/axiosInstance";

// Thunk to fetch emergency bills by providerId
export const fetchEmergencyBills = createAsyncThunk<
  EmergencyBill[],
  { providerId: string },
  { rejectValue: string }
>("emergencyBills/fetchAll", async ({ providerId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<EmergencyBillsResponse>(
      "/emergency-bill",
      {
        params: {
          ProviderId: providerId,
        },
      }
    );

    if (response.data.isSuccess) {
      return response.data.data;
    }

    return rejectWithValue(
      response.data.message || "Failed to fetch emergency bills"
    );
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching emergency bills"
    );
  }
});

//  to fetch emergencyBillDetails.ts
export const fetchEmergencyBillDetails = createAsyncThunk<
  EmergencyBill,
  {
    emergencyBillId: string;
    providerId: string;
  },
  { rejectValue: string }
>(
  "emergencyBills/fetchDetails",
  async ({ emergencyBillId, providerId }, { rejectWithValue }) => {
    try {
      // Use template literal to construct the URL with both IDs
      const response = await axiosInstance.get<EmergencyBillResponse>(
        `/emergency-bill/${emergencyBillId}/${providerId}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message || "Failed to fetch emergency bill details"
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while fetching emergency bill details"
      );
    }
  }
);

// Thunk to update an emergency bill
export const updateEmergencyBill = createAsyncThunk<
  EmergencyBill, // Return type
  {
    emergencyBillId: string;
    updateData: UpdateEmergencyBillType;
  }, // Argument type
  { rejectValue: string } // Reject value type
>(
  "emergencyBills/updateEmergencyBill",
  async ({ emergencyBillId, updateData }, { rejectWithValue }) => {
    try {
      // Ensure the ID in updateData matches the emergencyBillId
      const dataToSend = {
        ...updateData,
        id: emergencyBillId,
      };

      const response = await axiosInstance.put<EmergencyBillResponse>(
        `/emergency-bill/${emergencyBillId}`,
        dataToSend
      );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message || "Failed to update emergency bill"
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while updating the emergency bill"
      );
    }
  }
);

// delete an emergency bill
export const deleteEmergencyBill = createAsyncThunk<
  { 
    success: boolean; 
    message: string; 
    emergencyBillId: string; 
  }, // Return type
  string, // Argument type (just emergencyBillId)
  { rejectValue: string } // Reject value type
>(
  'emergencyBills/deleteEmergencyBill',
  async (emergencyBillId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<{
        message: string;
        isSuccess: boolean;
      }>(`/emergency-bill/${emergencyBillId}`);

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.message,
          emergencyBillId
        };
      }

      return rejectWithValue(
        response.data.message || 'Failed to delete emergency bill'
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'An error occurred while deleting the emergency bill'
      );
    }
  }
);