import { createSlice } from "@reduxjs/toolkit";
import type { StateData } from "../../types/stateTypes";
import { fetchStates } from "../thunks/fetchStatesThunk";

interface StatesState {
  data: StateData[];
  loading: boolean;
  error: string | null;
}

const initialState: StatesState = {
  data: [],
  loading: false,
  error: null,
};

const statesSlice = createSlice({
  name: "allStates",
  initialState,
  reducers: {
    // optional: clear states (useful on logout or reset)
    clearStates: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Fulfilled
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; //
      })

      //  Rejected
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearStates } = statesSlice.actions;
export default statesSlice.reducer;