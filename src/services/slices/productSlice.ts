import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchProducts, fetchProductById } from '../thunks/productThunk';
import type { ProductState, ProductItem, ProductSearchParams, ProductsResponse } from '../../types/productType';

// Initial state
const initialState: ProductState = {
  data: [],
  message: '',
  isSuccess: false,
  loading: false,
  error: null,
  searchParams: {
    searchTerm: '',
    page: 1,
    pageSize: 10
  },
  totalCount: 0,
  currentPage: 1,
  totalPages: 0
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Clear product data
    clearProductsData: (state) => {
      state.data = [];
      state.message = '';
      state.isSuccess = false;
      state.error = null;
    },
    
    // Reset loading and error states
    resetProductState: (state) => {
      state.loading = false;
      state.error = null;
    },
    
    // Set search parameters
    setSearchParams: (state, action: PayloadAction<Partial<ProductSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    
    // Clear search parameters
    clearSearchParams: (state) => {
      state.searchParams = {
        searchTerm: '',
        page: 1,
        pageSize: 10
      };
    },
    
    // Set a custom message
    setProductMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    
    // Add a new product (for optimistic updates)
    addProduct: (state, action: PayloadAction<ProductItem>) => {
      state.data.unshift(action.payload);
    },
    
    // Update an existing product
    updateProduct: (state, action: PayloadAction<ProductItem>) => {
      const index = state.data.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    
    // Remove a product
    removeProduct: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(product => product.id !== action.payload);
    },
    
    // Set pagination info
    setPagination: (state, action: PayloadAction<{ totalCount: number; currentPage: number; totalPages: number }>) => {
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProducts pending state
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSuccess = false;
        state.message = 'Loading products...';
      })
      
      // Handle fetchProducts fulfilled state
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductsResponse>) => {
        state.loading = false;
        state.isSuccess = action.payload.isSuccess;
        state.message = action.payload.message;
        state.data = action.payload.data || [];
        state.error = null;
        
        // Calculate pagination info
        if (state.searchParams.pageSize) {
          state.totalCount = action.payload.data?.length || 0;
          state.totalPages = Math.ceil(state.totalCount / state.searchParams.pageSize);
        }
      })
      
      // Handle fetchProducts rejected state
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.isSuccess = false;
        state.error = action.payload || 'Failed to fetch products';
        state.message = action.payload || 'Failed to fetch products';
        state.data = [];
      })
      
      // Handle fetchProductById pending state
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSuccess = false;
        state.message = 'Loading product details...';
      })
      
      // Handle fetchProductById fulfilled state
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.isSuccess = action.payload.isSuccess;
        state.message = action.payload.message;
        
        // If we have a single product, update or add it to the data array
        if (action.payload.data) {
          const existingIndex = state.data.findIndex(item => item.id === action.payload.data.id);
          if (existingIndex !== -1) {
            state.data[existingIndex] = action.payload.data;
          } else {
            state.data.push(action.payload.data);
          }
        }
        
        state.error = null;
      })
      
      // Handle fetchProductById rejected state
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.isSuccess = false;
        state.error = action.payload || 'Failed to fetch product details';
        state.message = action.payload || 'Failed to fetch product details';
      });
  },
});

// Export actions
export const { 
  clearProductsData, 
  resetProductState, 
  setSearchParams, 
  clearSearchParams,
  setProductMessage, 
  addProduct, 
  updateProduct, 
  removeProduct,
  setPagination 
} = productSlice.actions;

// Export reducer
export default productSlice.reducer;