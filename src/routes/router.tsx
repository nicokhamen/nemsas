import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../services/store/store";
import { getDashboardPath } from "../utils/roleUtils";
import Login from "../pages/auth/Login";
import Layout from "../layouts";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Unauthorized from "../pages/Unauthorized";
import Dashboard from "../pages/Dashboard";
import Tariffs from "../pages/Tariffs";
import Settings from "../pages/Settings";
import { AllProviders } from "../pages/state/providers/AllProviders";
import { EmergencyClaims } from "../pages/providers/claims-management/EmergencyClaims";
import EmergencyClaimsDetails from "../pages/providers/claims-management/EmergencyClaimsDetails";
import EmergencyClaimsView from "../pages/providers/claims-management/EmergencyClaimsView";
import { MDReview } from "../pages/md-review/MdReviewIndex";
import EndorsementReview from "../pages/md-review/EndorsementDetails";
import MdReviewPatients from "../pages/md-review/MdReviewPatients";
import MdReviewBills from "../pages/md-review/MdReviewBills";

import NewEmergencyBillWizard from "../pages/providers/bill-center/NewEmergencyBillWizard";
import { EmergencyBills } from "../pages/providers/bill-center/EmergencyBills";
import EmergencyBillDetails from "../pages/providers/bill-center/EmergencyBillDetails";
import EditEmergencyBill from "../pages/providers/bill-center/EditEmergencyBill";
import PatientEncounterDetails from "../pages/providers/claims-management/EncounterDetails";
import RegisterProvider from "../pages/state/providers/RegisterProvider";
import { StateClaims } from "../pages/state/vetting/StateClaimsVetting";
import { ClaimsTracking } from "../pages/state/tracking/ClaimsTracking";
import StateBillsVetting from "../pages/state/vetting/StateBillsVetting";
import StatePatientVetting from "../pages/state/vetting/StatePatientVetting";
import ErrorBoundary from "../pages/ErrorBoundary";
import { MDReview } from "../pages/md-review/MdReviewIndex";
import MdReviewBills from "../pages/md-review/MdReviewBills";
import EndorsementReview from "../pages/md-review/EndorsementDetails";

export interface RouteHandle {
  title?: string;
}

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return <Navigate to={getDashboardPath(user?.role || "Individual")} replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  
  // Protected Routes
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      // Dashboard router
      {
        path: "dashboard",
        element: <DashboardRouter />,
      },
      
      // ===== NEW STRUCTURE (Role-based paths) =====
      {
        path: "provider",
        element: <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]} />,
        children: [
          {
            path: "dashboard",
            element: <Layout><Dashboard /></Layout>,
            handle: { title: "Provider Dashboard" },
          },
          // Add other provider-specific routes here
        ],
      },
      
      // ===== ORIGINAL FLAT STRUCTURE (Keep existing links working) =====
      {
        path: "claims-management",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <EmergencyClaims />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Emergency Claims" },
      },
      {
        path: "emergency/claims/:id",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <EmergencyClaimsDetails />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Claim Details" },
      },
      {
        path: "emergency/claims/bills/:id",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <EmergencyClaimsView />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Claim Bills" },
      },
      {
        path: "emergency-bills/:claimId/:patientId",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <PatientEncounterDetails />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Patient Encounter Details" },
      },
      {
        path: "emergency/bills",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <EmergencyBills />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Emergency Bills" },
      },
      {
        path: "emergency/bills/:billId",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <EmergencyBillDetails />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Bill Details" },
      },
      
      // Provider Routes (Provider and MD roles)
      {
        path: "provider",
        element: <RoleRoute allowedRoles={["PROVIDER", "MD"]} />,
        children: [
          {
            path: "dashboard",
            element: (
              <Layout>
                <Dashboard />
              </Layout>
            ),
            handle: { title: "Provider Dashboard" },
          },
          {
            path: "claims-management",
            element: (
              <Layout>
                <EmergencyClaims />
              </Layout>
            ),
            handle: { title: "Emergency Claims" },
          },
          {
            path: "emergency/claims/:id",
            element: (
              <Layout>
                <EmergencyClaimsDetails />
              </Layout>
            ),
            handle: { title: "Claim Details" },
          },
          {
            path: "emergency/claims/bills/:id",
            element: (
              <Layout>
                <EmergencyClaimsView />
              </Layout>
            ),
            handle: { title: "Claim Bills" },
          },
          {
            path: "emergency-bills/:claimId/:patientId",
            element: (
              <Layout>
                <PatientEncounterDetails />
              </Layout>
            ),
            handle: { title: "Patient Encounter Details" },
          },
          {
            path: "emergency/bills",
            element: (
              <Layout>
                <EmergencyBills />
              </Layout>
            ),
            handle: { title: "Emergency Bills" },
          },
          {
            path: "emergency/bills/:billId",
            element: (
              <Layout>
                <EmergencyBillDetails />
              </Layout>
            ),
            handle: { title: "Bill Details" },
          },
          {
            path: "emergency-bills/:billId/edit",
            element: <EditEmergencyBill />,
            handle: { title: "Edit Bill" },
          },
          {
            path: "emergency/bill-capture",
            element: (
              <Layout>
                <NewEmergencyBillWizard />
              </Layout>
            ),
            handle: { title: "New Emergency Bill" },
          },
          {
            path: "tariff",
            element: (
              <Layout>
                <Tariffs />
              </Layout>
            ),
            handle: { title: "Tariff Management" },
          },
          {
            path: "settings",
            element: (
              <Layout>
                <Settings />
              </Layout>
            ),
            handle: { title: "Settings" },
          },
        ],
      },
      
      // MD Specific Routes
      {
        path: "md",
        element: <RoleRoute allowedRoles={["MD"]} />,
        children: [
          {
            path: "review",
            element: (
              <Layout>
                <MDReview />
              </Layout>
            ),
            handle: { title: "MD Review & Endorsement" },
          },
          {
            path: "review/:id",
            element: (
              <Layout>
                <MdReviewPatients />
              </Layout>
            ),
            handle: { title: "MD Review Details" },
          },
          {
            path: "review/:id/patients/:patientId/bills",
            element: (
              <Layout>
                <MdReviewBills />
              </Layout>
            ),
            handle: { title: "MD Review Bills" },
          },
          {
            path: "review/emergency-bills/:claimId/:patientId",
            element: (
              <Layout>
                <PatientEncounterDetails />
              </Layout>
            ),
            handle: { title: "Bill Details" },
          },
          {
            path: "endorsement-review",
            element: (
              <Layout>
                <EndorsementReview />
              </Layout>
            ),
            handle: { title: "Endorsement Review" },
          },
        ],
      },
      
      // Legacy MD Review URLs used by the current MD review flow
      {
        path: "md-review",
        element: (
          <RoleRoute allowedRoles={["MD", "Administrator"]}>
            <Layout>
              <MDReview />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "MD Review & Endorsement" },
      },
      {
        path: "md-review/:id",
        element: (
          <Layout>
            <MdReviewPatients />
          </Layout>
        ),
        handle: { title: "MD Review Details" },
      },
      {
        path: "md-review/:id/patients/:patientId/bills",
        element: (
          <Layout>
            <MdReviewBills />
          </Layout>
        ),
        handle: { title: "MD Review Bills" },
      },
      {
        path: "md-review/emergency-bills/:claimId/:patientId",
        element: (
          <Layout>
            <PatientEncounterDetails />
          </Layout>
        ),
        handle: { title: "Bill Details" },
      },
      {
        path: "providers/register",
        element: (
          <Layout>
            <RegisterProvider />
          </Layout>
        ),
      },
      {
        path: "providers/all",
        element: (
          <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
            <Layout>
              <AllProviders />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "All Providers" },
      },
      
      // State Routes
      {
        path: "state",
        element: <RoleRoute allowedRoles={["SSHIA", "NHIA", "ADMINISTRATOR"]} />,
        children: [
          {
            path: "dashboard",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <Dashboard />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "State Dashboard" },
          },
          {
            path: "providers/all",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <AllProviders />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "All Providers" },
          },
          {
            path: "provider/registration",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <RegisterProvider />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "Register Provider" },
          },
          {
            path: "provider/vetting",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <StateClaims />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "Emergency Claims Vetting" },
          },
          {
            path: "emergency/claims/:id",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <StateBillsVetting />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "Claim Bills" },
          },
          {
            path: "emergency-bills/:claimId/:patientId",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <StatePatientVetting />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "Patient Vetting Details" },
          },
          {
            path: "provider/tracking",
            element: (
              <RoleRoute allowedRoles={["SSHIA", "NHIA", "Administrator"]}>
                <Layout>
                  <ClaimsTracking />
                </Layout>
              </RoleRoute>
            ),
            handle: { title: "Claim Tracking" },
          },
          {
            path: "tariff",
            element: (
              <Layout>
                <Tariffs />
              </Layout>
            ),
            handle: { title: "Tariff Management" },
          },
          {
            path: "settings",
            element: (
              <Layout>
                <Settings />
              </Layout>
            ),
            handle: { title: "Settings" },
          },
        ],
      },
      
      // Admin Routes
      {
        path: "admin",
        element: <RoleRoute allowedRoles={["ADMINISTRATOR"]} />,
        children: [
          {
            path: "dashboard",
            element: (
              <Layout>
                <Dashboard />
              </Layout>
            ),
            handle: { title: "Admin Dashboard" },
          },
          {
            path: "settings",
            element: (
              <Layout>
                <Settings />
              </Layout>
            ),
            handle: { title: "Settings" },
          },
        ],
      },
      
      // HMO Routes
      {
        path: "hmo",
        element: <RoleRoute allowedRoles={["HMO"]} />,
        children: [
          {
            path: "dashboard",
            element: (
              <Layout>
                <Dashboard />
              </Layout>
            ),
            handle: { title: "HMO Dashboard" },
          },
          {
            path: "settings",
            element: (
              <Layout>
                <Settings />
              </Layout>
            ),
            handle: { title: "Settings" },
          },
        ],
      },
      
      // Enrollee Routes (Individual, Corporate)
      {
        path: "enrollee",
        element: <RoleRoute allowedRoles={["INDIVIDUAL", "CORPORATE"]} />,
        children: [
          {
            path: "dashboard",
            element: (
              <Layout>
                <Dashboard />
              </Layout>
            ),
            handle: { title: "Enrollee Dashboard" },
          },
          {
            path: "settings",
            element: (
              <Layout>
                <Settings />
              </Layout>
            ),
            handle: { title: "Settings" },
          },
        ],
      },
      
      // Legacy routes - redirect to new structure
      {
        path: "claims-management",
        element: <Navigate to="/provider/claims-management" replace />,
      },
      {
        path: "emergency/claims/:id",
        element: <Navigate to="/provider/emergency/claims/:id" replace />,
      },
      {
        path: "emergency/claims/bills/:id",
        element: <Navigate to="/provider/emergency/claims/bills/:id" replace />,
      },
      {
        path: "emergency-bills/:claimId/:patientId",
        element: <Navigate to="/provider/emergency-bills/:claimId/:patientId" replace />,
      },
      {
        path: "emergency/bills",
        element: <Navigate to="/provider/emergency/bills" replace />,
      },
      {
        path: "emergency/bills/:billId",
        element: <Navigate to="/provider/emergency/bills/:billId" replace />,
      },
      {
        path: "emergency/bill-capture",
        element: <Navigate to="/provider/emergency/bill-capture" replace />,
      },
      {
        path: "endorsement-review",
        element: <Navigate to="/md/endorsement-review" replace />,
      },
      {
        path: "tariff",
        element: <Navigate to="/state/tariff" replace />,
      },
      {
        path: "settings",
        element: <Navigate to="/state/settings" replace />,
      },
      
      // Catch-all error boundary
      // Admin Routes
{
  path: "admin",
  element: <RoleRoute allowedRoles={["Administrator", "SuperAdmin"]} />,
  children: [
    {
      path: "dashboard",
      element: <Layout><Dashboard /></Layout>,
      handle: { title: "Admin Dashboard" },
    },
    // ... other admin routes
  ],
},
      
      // Catch-all
      {
        path: "*",
        element: <ErrorBoundary />,
      },
    ],
  },
]);

export default router;