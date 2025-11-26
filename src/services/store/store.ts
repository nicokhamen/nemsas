import { configureStore } from "@reduxjs/toolkit";

import { providerApiSlice } from "../slices/providerSlice";
import authReducer from "../slices/authSlice";
import { toastMiddleware } from "./middleware/toastMiddleware";
import corporateReducer from "../slices/corporateSlice"
import { enrolleeClassReducer, enrolleeTypeReducer, genderReducer, maritalStatusReducer, planTypeReducer, relationshipReducer } from "../slices/resourceSlice";
import claimsReducer from "../slices/claimSlice"
import providerReducer from "../slices/iProviderSlice"
import claimDetailsReducer from "../slices/claimDetailSlice"
import nemsasReducer from "../slices/nemsasSlice"
import patientReducer from '../slices/patientSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    corporate: corporateReducer,
    gender: genderReducer,
    maritalStatus: maritalStatusReducer,
    relations: relationshipReducer,
    enrolleeType: enrolleeTypeReducer,
    planType: planTypeReducer,
    enrolleeClass: enrolleeClassReducer,
    claims: claimsReducer,
    claimDetails: claimDetailsReducer,
    nemsas: nemsasReducer,
    allProviders: providerReducer,
    patient: patientReducer,
    [providerApiSlice.reducerPath]: providerApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(providerApiSlice.middleware)
      .concat(toastMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
