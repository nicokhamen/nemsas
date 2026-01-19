import { createSlice } from '@reduxjs/toolkit';
import { mdVetEmergencyClaim } from '../thunks/mdRequestThunk';

interface MdEmergencyVettingState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

const initialState: MdEmergencyVettingState = {
  isLoading: false,
  isSuccess: false,
  error: null,
};

const mdEmergencyVettingSlice = createSlice({
  name: 'mdEmergencyVetting',
  initialState,
  reducers: {
    resetMdEmergencyVettingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(mdVetEmergencyClaim.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(mdVetEmergencyClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = action.payload.data;
      })
      .addCase(mdVetEmergencyClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? 'Failed to vet emergency claim';
        state.isSuccess = false;
      });
  },
});

export const { resetMdEmergencyVettingState } =
  mdEmergencyVettingSlice.actions;

export default mdEmergencyVettingSlice.reducer;
