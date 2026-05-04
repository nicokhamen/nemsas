import {
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../services/store/store";
import { getDashboardPath } from "../utils/roleUtils";
import Layout from "../layouts";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import type { Role } from "../types/roles";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const Login = lazy(() => import("../pages/auth/Login"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Tariffs = lazy(() => import("../pages/Tariffs"));
const Settings = lazy(() => import("../pages/Settings"));

const AllProviders = lazy(() =>
  import("../pages/state/providers/AllProviders").then((module) => ({
    default: module.AllProviders,
  })),
);
const EmergencyClaims = lazy(() =>
  import("../pages/providers/claims-management/EmergencyClaims").then(
    (module) => ({
      default: module.EmergencyClaims,
    }),
  ),
);
const EmergencyClaimsDetails = lazy(
  () => import("../pages/providers/claims-management/EmergencyClaimsDetails"),
);
const EmergencyClaimsView = lazy(
  () => import("../pages/providers/claims-management/EmergencyClaimsView"),
);
const MdReviewPatients = lazy(
  () => import("../pages/md-review/MdReviewPatients"),
);
const NewEmergencyBillWizard = lazy(
  () => import("../pages/providers/bill-center/NewEmergencyBillWizard"),
);
const EmergencyBills = lazy(() =>
  import("../pages/providers/bill-center/EmergencyBills").then((module) => ({
    default: module.EmergencyBills,
  })),
);
const EmergencyBillDetails = lazy(
  () => import("../pages/providers/bill-center/EmergencyBillDetails"),
);
const EditEmergencyBill = lazy(
  () => import("../pages/providers/bill-center/EditEmergencyBill"),
);
const PatientEncounterDetails = lazy(
  () => import("../pages/providers/claims-management/EncounterDetails"),
);
const RegisterProvider = lazy(
  () => import("../pages/state/providers/RegisterProvider"),
);
const StateClaims = lazy(() =>
  import("../pages/state/vetting/StateClaimsVetting").then((module) => ({
    default: module.StateClaims,
  })),
);
const ClaimsTracking = lazy(() =>
  import("../pages/state/tracking/ClaimsTracking").then((module) => ({
    default: module.ClaimsTracking,
  })),
);
const StateBillsVetting = lazy(
  () => import("../pages/state/vetting/StateBillsVetting"),
);
const StatePatientVetting = lazy(
  () => import("../pages/state/vetting/StatePatientVetting"),
);
const ErrorBoundary = lazy(() => import("../pages/ErrorBoundary"));
const MDReview = lazy(() =>
  import("../pages/md-review/MdReviewIndex").then((module) => ({
    default: module.MDReview,
  })),
);
const MdReviewBills = lazy(() => import("../pages/md-review/MdReviewBills"));
const EndorsementReview = lazy(
  () => import("../pages/md-review/EndorsementDetails"),
);

export interface RouteHandle {
  title?: string;
}

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <LoadingSpinner size="medium" color="text-red-500" />
  </div>
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return <Navigate to={getDashboardPath(user?.role || "Individual")} replace />;
};

// Helper function to wrap routes with Layout and RoleRoute
const createProtectedRoute = (
  Component: LazyExoticComponent<ComponentType>,
  allowedRoles: Role[],
  title: string,
) => ({
  element: (
    <RoleRoute allowedRoles={allowedRoles}>
      <Layout>
        {withSuspense(<Component />)}
      </Layout>
    </RoleRoute>
  ),
  handle: { title },
});

// Helper for routes without Layout wrapper
const createSimpleProtectedRoute = (
  Component: LazyExoticComponent<ComponentType>,
  allowedRoles: Role[],
  title: string,
) => ({
  element: (
    <RoleRoute allowedRoles={allowedRoles}>
      {withSuspense(<Component />)}
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
    element: withSuspense(<Login />),
  },
  {
    path: "/unauthorized",
    element: withSuspense(<Unauthorized />),
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
        element: withSuspense(<ErrorBoundary />),
      },
    ],
  },
]);

export default router;
