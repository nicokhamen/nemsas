import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Layout from "../layouts";
import { ProviderProvider } from "../context/ProviderContext";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";

import Tariffs from "../pages/Tariffs";
import Settings from "../pages/Settings";

import AllProviders from "../pages/provider/AllProviders";
import { ProviderRegistration } from "../pages/provider/Registration";
import { VettingClaims } from "../pages/vetting/VettingClaims";
import ProviderDetails from "../pages/provider/ProviderDetails";
import { Claims } from "../pages/providers/claims-management/EmergencyClaims";
// import EBillCapture from "../../pages/bill-center";
// import NewEmergencyBillWizard from "../pages/bill-center/NewEmergencyBillWizard";
// import { MDReview } from "../pages/md-review/MdReviewIndex";
// import EndorsementReview from "../pages/md-review/EndorsementReview";

// import { EmergencyBills } from "../pages/bill-center/EmergencyBills";
// import EmergencyBillDetails from "../pages/bill-center/EmergencyBillDetails";
// import EditEmergencyBill from "../pages/bill-center/EditEmergencyBill";
import EmergencyClaimsDetails from "../pages/providers/claims-management/EmergencyClaimsDetails";
// import MdReviewBills from "../pages/md-review/MdReviewBills";
import EmergencyClaimsView from "../pages/providers/claims-management/EmergencyClaimsView";
import { MDReview } from "../pages/providers/md-review/MdReviewIndex";
import EndorsementReview from "../pages/providers/md-review/EndorsementDetails";
import MdReviewBills from "../pages/providers/md-review/MdReviewBills";
import EBillCapture from "../pages/providers/bill-center";
import NewEmergencyBillWizard from "../pages/providers/bill-center/NewEmergencyBillWizard";
import { EmergencyBills } from "../pages/providers/bill-center/EmergencyBills";
import EmergencyBillDetails from "../pages/providers/bill-center/EmergencyBillDetails";
import EditEmergencyBill from "../pages/providers/bill-center/EditEmergencyBill";
import PatientEncounterDetails from "../pages/providers/claims-management/EncounterDetails";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProviderProvider>
              <ProtectedRoute />
            </ProviderProvider>
          }
        >
          <Route
            path="claims-management"
            element={
              <Layout>
                <Claims />
              </Layout>
            }
          />
          <Route
            path="emergency/claims/:id"
            element={
              <Layout>
                <EmergencyClaimsDetails />
              </Layout>
            }
          />
          <Route
            path="emergency/claims/bills/:id"
            element={
              <Layout>
                <EmergencyClaimsView />
              </Layout>
            }
          />
          <Route
            path="dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
        

          <Route
            path="emergency/bills"
            element={
              <Layout>
                <EmergencyBills />
              </Layout>
            }
          />
          <Route
            path="/emergency/bills/:billId"
            element={
              <Layout>
                <EmergencyBillDetails />
              </Layout>
            }
          />
          <Route
            path="/emergency-bills/:billId/edit"
            element={<EditEmergencyBill />}
          />
          <Route
            path="md-review"
            element={
              <Layout>
                <MDReview />
              </Layout>
            }
          />
          <Route
            path="md-review/:id"
            element={
              <Layout>
                <MdReviewBills />
              </Layout>
            }
          />
          <Route
            path="endorsement-review"
            element={
              <Layout>
                <EndorsementReview />
              </Layout>
            }
          />

          <Route
            path="tariff"
            element={
              <Layout>
                <Tariffs />
              </Layout>
            }
          />
          <Route
            path="settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />

          <Route
            path="providers/:id"
            element={
              <Layout>
                <ProviderDetails />
              </Layout>
            }
          />

          <Route path="nemsas/">
            <Route
              path="dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            <Route
              path="providers/all"
              element={
                <Layout>
                  <AllProviders />
                </Layout>
              }
            />
            <Route
              path="provider/registration"
              element={
                <Layout>
                  <ProviderRegistration />
                </Layout>
              }
            />

            <Route
              path="vetting/claims"
              element={
                <Layout>
                  <VettingClaims />
                </Layout>
              }
            />
          </Route>
          <Route
            path="emergency/bill-capture"
            element={
              <Layout>
                <NewEmergencyBillWizard />
              </Layout>
            }
          />
          <Route
            path="/emergency-bills/:patientId"
            element={
              <Layout>
                <PatientEncounterDetails />
              </Layout>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
