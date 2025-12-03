import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import axiosInstance from '../../config/axiosInstance';
import type { ProductsResponse,ProductSearchParams, ProductItem } from '../../types/productType';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk<
  ProductsResponse,
  ProductSearchParams,
  { rejectValue: string }
>(
  'products/fetchProducts',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>('/product', {
        params: {
          search: searchParams.searchTerm,
          category: searchParams.category,
          isCovered: searchParams.isCovered,
          type: searchParams.type,
          page: searchParams.page,
          pageSize: searchParams.pageSize
        },
      });
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      
      // Handle different error scenarios
      if (axiosError.response) {
        // Server responded with error status
        const errorMessage = axiosError.response.data?.message 
          || `Server error: ${axiosError.response.status}`;
        return rejectWithValue(errorMessage);
      } else if (axiosError.request) {
        // Request was made but no response received
        return rejectWithValue('Network error. Please check your connection.');
      } else {
        // Something else happened
        return rejectWithValue('An unexpected error occurred.');
      }
    }
  }
);

// Async thunk for fetching a single product by ID
export const fetchProductById = createAsyncThunk<
  { data: ProductItem } & Omit<ProductsResponse, 'data'>,
  string,
  { rejectValue: string }
>(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ data: ProductItem } & Omit<ProductsResponse, 'data'>>(`/product/${productId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      
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