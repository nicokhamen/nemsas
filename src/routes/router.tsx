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
import MdReviewPatients from "../pages/md-review/MdReviewPatients";
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
import type { Role } from "../types/roles";

export interface RouteHandle {
  title?: string;
}

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return <Navigate to={getDashboardPath(user?.role || "Individual")} replace />;
};

// Helper function to wrap routes with Layout and RoleRoute
const createProtectedRoute = (
  Component: React.ComponentType, 
  allowedRoles: Role[], // Changed from Role to Role[]
  title: string
) => ({
  element: (
    <RoleRoute allowedRoles={allowedRoles}>
      <Layout>
        <Component />
      </Layout>
    </RoleRoute>
  ),
  handle: { title },
});

// Helper for routes without Layout wrapper
const createSimpleProtectedRoute = (
  Component: React.ComponentType,
  allowedRoles: Role[], // Changed from Role to Role[]
  title: string
) => ({
  element: (
    <RoleRoute allowedRoles={allowedRoles}>
      <Component />
    </RoleRoute>
  ),
  handle: { title },
});

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
  
  // Protected Routes - Maintaining flat structure for compatibility
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      // Dashboard router
      {
        path: "dashboard",
        element: <DashboardRouter />,
      },
      
      // Provider/Claims Management Routes (flat structure)
      {
        path: "claims-management",
        ...createProtectedRoute(EmergencyClaims, ["Provider", "Administrator", "MD"], "Emergency Claims"),
      },
      {
        path: "emergency/claims/:id",
        ...createProtectedRoute(EmergencyClaimsDetails, ["Provider", "Administrator", "MD"], "Claim Details"),
      },
      {
        path: "emergency/claims/bills/:id",
        ...createProtectedRoute(EmergencyClaimsView, ["Provider", "Administrator", "MD"], "Claim Bills"),
      },
      {
        path: "emergency-bills/:claimId/:patientId",
        ...createProtectedRoute(PatientEncounterDetails, ["Provider", "Administrator", "MD"], "Patient Encounter Details"),
      },
      {
        path: "emergency/bills",
        ...createProtectedRoute(EmergencyBills, ["Provider", "Administrator", "MD"], "Emergency Bills"),
      },
      {
        path: "emergency/bills/:billId",
        ...createProtectedRoute(EmergencyBillDetails, ["Provider", "Administrator", "MD"], "Bill Details"),
      },
      {
        path: "emergency-bills/:billId/edit",
        ...createSimpleProtectedRoute(EditEmergencyBill, ["Provider", "MD", "Administrator"], "Edit Bill"), // Added Administrator
      },
      {
        path: "emergency/bill-capture",
        ...createProtectedRoute(NewEmergencyBillWizard, ["Provider", "MD", "Administrator"], "New Emergency Bill"), // Added Administrator
      },
      {
        path: "tariff",
        ...createProtectedRoute(Tariffs, ["Provider", "MD", "SSHIA", "NHIA", "Administrator"], "Tariff Management"),
      },
      {
        path: "settings",
        ...createProtectedRoute(Settings, ["Provider", "MD", "SSHIA", "NHIA", "Administrator", "HMO", "Individual", "Corporate"], "Settings"),
      },
      
      // MD Review Routes
      {
        path: "md-review",
        ...createProtectedRoute(MDReview, ["MD", "Administrator"], "MD Review & Endorsement"),
      },
      {
        path: "md-review/:id",
        ...createProtectedRoute(MdReviewPatients, ["MD", "Administrator"], "MD Review Details"),
      },
      {
        path: "md-review/:id/patients/:patientId/bills",
        ...createProtectedRoute(MdReviewBills, ["MD", "Administrator"], "MD Review Bills"),
      },
      {
        path: "md-review/emergency-bills/:claimId/:patientId",
        ...createProtectedRoute(PatientEncounterDetails, ["MD", "Administrator"], "Bill Details"),
      },
      {
        path: "endorsement-review",
        ...createProtectedRoute(EndorsementReview, ["MD", "Administrator"], "Endorsement Review"),
      },
      
      // Provider Registration & Management
      {
        path: "providers/register",
        ...createProtectedRoute(RegisterProvider, ["Provider", "SSHIA", "NHIA", "Administrator"], "Register Provider"),
      },
      {
        path: "providers/all",
        ...createProtectedRoute(AllProviders, ["SSHIA", "NHIA", "Administrator"], "All Providers"),
      },
      
      // State Routes
      {
        path: "state/dashboard",
        ...createProtectedRoute(Dashboard, ["SSHIA", "NHIA", "Administrator"], "State Dashboard"),
      },
      {
        path: "state/providers/all",
        ...createProtectedRoute(AllProviders, ["SSHIA", "NHIA", "Administrator"], "All Providers"),
      },
      {
        path: "state/provider/registration",
        ...createProtectedRoute(RegisterProvider, ["SSHIA", "NHIA", "Administrator"], "Register Provider"),
      },
      {
        path: "state/provider/vetting",
        ...createProtectedRoute(StateClaims, ["SSHIA", "NHIA", "Administrator"], "Emergency Claims Vetting"),
      },
      {
        path: "state/emergency/claims/:id",
        ...createProtectedRoute(StateBillsVetting, ["SSHIA", "NHIA", "Administrator"], "Claim Bills"),
      },
      {
        path: "state/emergency-bills/:claimId/:patientId",
        ...createProtectedRoute(StatePatientVetting, ["SSHIA", "NHIA", "Administrator"], "Patient Vetting Details"),
      },
      {
        path: "state/provider/tracking",
        ...createProtectedRoute(ClaimsTracking, ["SSHIA", "NHIA", "Administrator"], "Claim Tracking"),
      },
      {
        path: "state/tariff",
        ...createProtectedRoute(Tariffs, ["SSHIA", "NHIA", "Administrator"], "Tariff Management"),
      },
      {
        path: "state/settings",
        ...createProtectedRoute(Settings, ["SSHIA", "NHIA", "Administrator"], "Settings"),
      },
      
      // Admin Routes
      {
        path: "admin/dashboard",
        ...createProtectedRoute(Dashboard, ["Administrator", "SuperAdmin"], "Admin Dashboard"),
      },
      {
        path: "admin/settings",
        ...createProtectedRoute(Settings, ["Administrator", "SuperAdmin"], "Settings"),
      },
      
      // HMO Routes
      {
        path: "hmo/dashboard",
        ...createProtectedRoute(Dashboard, ["HMO"], "HMO Dashboard"),
      },
      {
        path: "hmo/settings",
        ...createProtectedRoute(Settings, ["HMO"], "Settings"),
      },
      
      // Enrollee Routes
      {
        path: "enrollee/dashboard",
        ...createProtectedRoute(Dashboard, ["Individual", "Corporate"], "Enrollee Dashboard"),
      },
      {
        path: "enrollee/settings",
        ...createProtectedRoute(Settings, ["Individual", "Corporate"], "Settings"),
      },
      
      // Catch-all error boundary
      {
        path: "*",
        element: <ErrorBoundary />,
      },
    ],
  },
]);

export default router;
