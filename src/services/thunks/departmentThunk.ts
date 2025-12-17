import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { DepartmentsResponse, ServiceCategoryResponse } from '../../types/emergency-bill';
import type { ApiError, EncounterFormData, EncounterResponse } from '../../types/encounter';
import type { AxiosError } from 'axios';

// fetch departments 
export const fetchDepartments = createAsyncThunk<
  DepartmentsResponse,
  void,
  { rejectValue: string }
>(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<DepartmentsResponse>('/department');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch departments');
      }
      return rejectWithValue('Network error or server is unreachable');
    }
  }
);
// fetching service-categories
export const fetchServiceCategories = createAsyncThunk<
  ServiceCategoryResponse,
  void,
  { rejectValue: string }
>(
  'departments/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ServiceCategoryResponse>('/service-category');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch Service Categories');
      }
      return rejectWithValue('Network error or server is unreachable');
    }
  }
);

// creating a new emergency-bill
export const createEncounter = createAsyncThunk<
  EncounterResponse,
  EncounterFormData,
  { rejectValue: ApiError }
>(
  'encounter/createEncounter',
  async (encounterData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<EncounterResponse>(
        '/emergency-bill', 
        encounterData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response) {
        // Server responded with error status
        return rejectWithValue({
          message: axiosError.response.data.message || 'An error occurred',
          status: axiosError.response.status,
          errors: axiosError.response.data.errors,
        });
      } else if (axiosError.request) {
        // Request made but no response
        return rejectWithValue({
          message: 'No response received from server',
        });
      } else {
        // Something else happened
        return rejectWithValue({
          message: axiosError.message || 'Failed to create encounter',
        });
      }
    }
  }
);