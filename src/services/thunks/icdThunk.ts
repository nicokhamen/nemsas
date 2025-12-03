import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { ICDResponse } from '../../types/emergency-bill';
import axiosInstance from '../../config/axiosInstance';

export const fetchICDCodes = createAsyncThunk<
  ICDResponse,
  { codeType: string; searchTerm: string },
  { rejectValue: string }
>(
  'icd/fetchICDCodes',
  async ({ codeType, searchTerm }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ICDResponse>(
        '/settings/classification-code',
        {
          params: {
            CodeType: codeType,
            Search: searchTerm,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      
      // Handle different error scenarios
      if (axiosError.response) {
       
        const errorMessage = axiosError.response.data?.message 
          || `Server error: ${axiosError.response.status}`;
        return rejectWithValue(errorMessage);
      } else if (axiosError.request) {
      
        return rejectWithValue('Network error. Please check your connection.');
      } else {
       
        return rejectWithValue('An unexpected error occurred.');
      }
    }
  }
);