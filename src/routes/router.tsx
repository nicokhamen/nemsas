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
// import { MDReview } from "../../pages/providers/md-review/MdReviewIndex";
// import EndorsementReview from "../pages/providers/md-review/EndorsementDetails";
// import MdReviewBills from "../pages/providers/md-review/MdReviewBills";
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
      {
        path: "emergency-bills/:billId/edit",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <EditEmergencyBill />
          </RoleRoute>
        ),
        handle: { title: "Edit Bill" },
      },
      {
        path: "emergency/bill-capture",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD"]}>
            <Layout>
              <NewEmergencyBillWizard />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "New Emergency Bill" },
      },
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
          <RoleRoute allowedRoles={["MD", "Administrator"]}>
            <Layout>
              <MdReviewBills />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "MD Review Details" },
      },
      {
        path: "endorsement-review",
        element: (
          <RoleRoute allowedRoles={["MD", "Administrator"]}>
            <Layout>
              <EndorsementReview />
            </Layout>
          </RoleRoute>
        ),
        handle: { title: "Endorsement Review" },
      },
      {
        path: "tariff",
        element: (
          <RoleRoute allowedRoles={["Provider", "Administrator", "MD", "SSHIA", "NHIA"]}>
            <Layout>
              <Tariffs />
            </Layout>
          </RoleRoute>
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
        ],
      },
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