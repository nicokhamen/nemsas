import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import type { DepartmentsResponse, ServiceCategoryResponse } from '../../types/emergency-bill';

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