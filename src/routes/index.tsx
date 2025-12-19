import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Layout from "../layouts";
import { ProviderProvider } from "../context/ProviderContext";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";

import Tariffs from "../pages/Tariffs";
import Settings from "../pages/Settings";
import EnrolleesManagement from "../pages/EnrolleesManagement";
import EnrolleeDetails from "../pages/EnrolleeDetails";

import AllProviders from "../pages/provider/AllProviders";
import { ProviderRegistration } from "../pages/provider/Registration";
import { VettingClaims } from "../pages/vetting/VettingClaims";
import ProviderDetails from "../pages/provider/ProviderDetails";
import { Claims } from "../pages/claims-management/EmergencyClaims";
import EBillCapture from "../pages/bill-center";
import { MDReview } from "../pages/md-review/MdReviewIndex";
import EndorsementReview from "../pages/md-review/EndorsementReview";
import ClaimsDetails from "../pages/claims-management/ClaimsDetails";
import CreateClaim from "../pages/claims-management/CreateClaim";
import { EmergencyBills } from "../pages/bill-center/EmergencyBills";
import EmergencyBillDetails from "../pages/bill-center/EmergencyBillDetails";
import EditEmergencyBill from "../pages/bill-center/EditEmergencyBill";


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
        <Route path="claim-details" element={<Layout><ClaimsDetails /></Layout>} />
        <Route path="create-claim" element={<Layout><CreateClaim /></Layout>} />
         
          <Route path="claims-management" element={<Layout><Claims /></Layout>} />
          <Route path="emergency/bills" element={<Layout><EmergencyBills/></Layout>} />
          <Route path="/emergency/bills/:billId" element={<Layout><EmergencyBillDetails/></Layout>} />
          <Route path="/emergency-bills/:billId/edit" element={<EditEmergencyBill />} />
          <Route path="md-review" element={<Layout><MDReview/></Layout>} />
          <Route path="endorsement-review" element={<Layout><EndorsementReview/></Layout>} />


          <Route path="enrollee-management" element={<Layout><EnrolleesManagement /></Layout>} />
          <Route path="enrollees/:id" element={<Layout><EnrolleeDetails /></Layout>} />
          <Route path="tariff" element={<Layout><Tariffs /></Layout>} />
          <Route path="settings" element={<Layout><Settings /></Layout>} />

    
          <Route path="providers/:id" element={<Layout><ProviderDetails /></Layout>} />
          
          <Route path="nemsas/">
       
           <Route path="dashboard" element={<Layout><Dashboard /></Layout>} />
    

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
