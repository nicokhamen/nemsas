import { createSlice } from "@reduxjs/toolkit";
import { createProvider, getProviders } from "../thunks/stateProviderThunk";

interface CreateProviderState {
  loading: boolean;
  success: boolean;
  error: string | null;
  provider: any | null;
  providers: any[];
}

const initialState: CreateProviderState = {
  loading: false,
  success: false,
  error: null,
  provider: null,
  providers: [],
};

const createProviderSlice = createSlice({
  name: "createProvider",
  initialState,
  reducers: {
    resetCreateProviderState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.provider = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createProvider.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.provider = action.payload;
      })
      .addCase(createProvider.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // GET PROVIDERS
      .addCase(getProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload.data;
      })
      .addCase(getProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCreateProviderState } = createProviderSlice.actions;
export default createProviderSlice.reducer;