import { configureStore } from "@reduxjs/toolkit";

import { providerApiSlice } from "../slices/providerSlice";
import authReducer from "../slices/authSlice";
import { toastMiddleware } from "./middleware/toastMiddleware";
import corporateReducer from "../slices/corporateSlice";
import claimsReducer from "../slices/claimSlice";
import providerReducer from "../slices/iProviderSlice";
import claimDetailsReducer from "../slices/claimDetailSlice";
import nemsasReducer from "../slices/nemsasSlice";
import patientReducer from "../slices/patientSlice";
import departmentReducer from "../slices/DepartmentSlice";
import serviceCategoryReducer from "../slices/serviceCategorySlice";
import icdReducer from "../slices/icdSlice";
import productReducer from "../slices/productSlice";
import encounterReducer from "../slices/encounterSlice";
import emergencyClaimReducer from "../slices/emergencyClaimSlice";
import emergencyClaimDetailReducer from "../slices/emergencyClaimDetailSlice";
import emergencyBillsReducer from "../slices/emergencyBillSlice"
import claimsEmergencyBillsReducer from "../slices/claimEmergencyBillsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    corporate: corporateReducer,

    claims: claimsReducer,
    claimDetails: claimDetailsReducer,
    nemsas: nemsasReducer,
    allProviders: providerReducer,
    patient: patientReducer,
    departments: departmentReducer,
    serviceCategories: serviceCategoryReducer,
    icd: icdReducer,
    products: productReducer,
    encounter: encounterReducer,
    emergencyBills: emergencyBillsReducer,
    emergencyClaim: emergencyClaimReducer,
    emergencyClaimDetail: emergencyClaimDetailReducer,
    claimsEmergencyBills: claimsEmergencyBillsReducer,
    [providerApiSlice.reducerPath]: providerApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(providerApiSlice.middleware)
      .concat(toastMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
