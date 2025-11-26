import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Layout from "../layouts";
import { ProviderProvider } from "../context/ProviderContext";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";

import { ClaimsManagement } from "../pages/ClaimsManagement";

import Tariffs from "../pages/Tariffs";
import Settings from "../pages/Settings";
import EnrolleesManagement from "../pages/EnrolleesManagement";
import EnrolleeDetails from "../pages/EnrolleeDetails";

import Individual from "../pages/enrollee/registration/Individual";

import EnrolleesPage from "../pages/enrollee/EnrolleesPage";
import Corporate from "../pages/enrollee/registration/Corporate";
import { NemsasManagement } from "../pages/nemsas/NemsasManagement";
import AllProviders from "../pages/provider/AllProviders";
import { ProviderRegistration } from "../pages/provider/Registration";
import { VettingClaims } from "../pages/vetting/VettingClaims";
import ProviderDetails from "../pages/provider/ProviderDetails";
import EBillCapture from "../pages/provider";
// import Claims from "../pages/payments/Claims";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProviderProvider><ProtectedRoute /></ProviderProvider>}> 
        <Route path="dashboard" element={<Layout><Dashboard /></Layout>} />
         
          <Route path="claims" element={<Layout><ClaimsManagement /></Layout>} />
          <Route path="nemsas-management" element={<Layout><NemsasManagement /></Layout>} />
          <Route path="enrollee-management" element={<Layout><EnrolleesManagement /></Layout>} />
          <Route path="enrollees/:id" element={<Layout><EnrolleeDetails /></Layout>} />
          <Route path="tariff" element={<Layout><Tariffs /></Layout>} />
          <Route path="settings" element={<Layout><Settings /></Layout>} />

          {/* Individual Provider route */}
          <Route path="providers/:id" element={<Layout><ProviderDetails /></Layout>} />
          
          <Route path="nemsas/">
       
           <Route path="dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="enrollees" element={<Layout><EnrolleesPage /></Layout>} />
          
          <Route path="registration/individual" element={<Layout><Individual /></Layout>} />
          <Route path="registration/corporate" element={<Layout><Corporate /></Layout>} />

               <Route path="providers/all" element={<Layout><AllProviders /></Layout>} />
               <Route path="provider/registration" element={<Layout><ProviderRegistration /></Layout>} />
              

               <Route path="vetting/claims" element={<Layout><VettingClaims /></Layout>} />
             
          </Route>
            <Route path="emergency/bill-capture" element={<Layout><EBillCapture/></Layout>} />
        </Route>
         
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
