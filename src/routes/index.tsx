import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Layout from "../layouts";
import { ProviderProvider } from "../context/ProviderContext";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";

import Tariffs from "../pages/Tariffs";
import Settings from "../pages/Settings";

import { AllProviders } from "../pages/state/providers/AllProviders";
import { Claims } from "../pages/providers/claims-management/EmergencyClaims";
import EmergencyClaimsDetails from "../pages/providers/claims-management/EmergencyClaimsDetails";
import EmergencyClaimsView from "../pages/providers/claims-management/EmergencyClaimsView";
import { MDReview } from "../pages/providers/md-review/MdReviewIndex";
import EndorsementReview from "../pages/providers/md-review/EndorsementDetails";
import MdReviewBills from "../pages/providers/md-review/MdReviewBills";
import NewEmergencyBillWizard from "../pages/providers/bill-center/NewEmergencyBillWizard";
import { EmergencyBills } from "../pages/providers/bill-center/EmergencyBills";
import EmergencyBillDetails from "../pages/providers/bill-center/EmergencyBillDetails";
import EditEmergencyBill from "../pages/providers/bill-center/EditEmergencyBill";
import PatientEncounterDetails from "../pages/providers/claims-management/EncounterDetails";
import RegisterProvider from "../pages/state/providers/RegisterProvider";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ProviderProvider>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public route */}
          <Route path="/login" element={<Login />} />
         
          <Route
            path="providers/register"
            element={
              <Layout>
                <RegisterProvider />
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
            path="/"
            element={
              //  <ProviderProvider>

              <ProtectedRoute />
            }
          >
            {/* ========== PROVIDER SECTION ========== */}
            {/* Dashboard */}
            <Route
              path="dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            {/* Claims Management */}
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
              path="/emergency-bills/:claimId/:patientId"
              element={
                <Layout>
                  <PatientEncounterDetails />
                </Layout>
              }
            />

            {/* Bill Center */}
            <Route
              path="emergency/bills"
              element={
                <Layout>
                  <EmergencyBills />
                </Layout>
              }
            />
            <Route
              path="emergency/bills/:billId"
              element={
                <Layout>
                  <EmergencyBillDetails />
                </Layout>
              }
            />
            <Route
              path="emergency-bills/:billId/edit"
              element={<EditEmergencyBill />}
            />
            <Route
              path="emergency/bill-capture"
              element={
                <Layout>
                  <NewEmergencyBillWizard />
                </Layout>
              }
            />

            {/* MD Review */}
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

            {/* Settings & Tariffs */}
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

            {/* ========== STATE/NEMSAS SECTION ========== */}
            <Route path="state">
              {/* State Dashboard */}
              <Route
                path="dashboard"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />

              {/* Provider Management (for state to view all providers) */}
              <Route
                path="providers/all"
                element={
                  <Layout>
                    <AllProviders />
                  </Layout>
                }
              />

              {/* Provider Registration (for state to register new providers) */}
              <Route
                path="provider/registration"
                element={
                  <Layout>
                    <RegisterProvider />
                  </Layout>
                }
              />

              {/* Provider Details (for state to view specific provider details) */}
             
            </Route>

            {/* ========== CATCH-ALL ROUTE ========== */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </ProviderProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
