import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EmergencyBillPatients } from "../../types/emergency-bill-patients";
import { fetchEmergencyBillPatients } from "../thunks/emergencyBillPatientsThunk";

interface EmergencyBillPatientsState {
  data: EmergencyBillPatients | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmergencyBillPatientsState = {
  data: null,
  loading: false,
  error: null,
};

const emergencyBillPatientsSlice = createSlice({
  name: "emergencyBillPatients",
  initialState,
  reducers: {
    clearEmergencyBillPatients(state) {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmergencyBillPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEmergencyBillPatients.fulfilled,
        (state, action: PayloadAction<EmergencyBillPatients>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchEmergencyBillPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearEmergencyBillPatients } =
  emergencyBillPatientsSlice.actions;

export default emergencyBillPatientsSlice.reducer;