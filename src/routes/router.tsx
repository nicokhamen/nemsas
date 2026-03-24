// router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Layout from "../layouts";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Tariffs from "../pages/Tariffs";
import Settings from "../pages/Settings";
import { AllProviders } from "../pages/state/providers/AllProviders";
import { EmergencyClaims } from "../pages/providers/claims-management/EmergencyClaims";
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
import { StateClaims } from "../pages/state/vetting/StateClaimsVetting";
import ClaimsTracking from "../pages/state/tracking/ClaimsTracking";


export interface RouteHandle {
  title?: string;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/providers/register",
    element: (
      <Layout>
        <RegisterProvider />
      </Layout>
    ),
  },
  {
    path: "/providers/all",
    element: (
      <Layout>
        <AllProviders />
      </Layout>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard",
        element: (
          <Layout>
            <Dashboard />
          </Layout>
        ),
        handle: { title: "Dashboard" },
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
        path: "md-review",
        element: (
          <Layout>
            <MDReview />
          </Layout>
        ),
        handle: { title: "MD Review & Endorsement" },
      },
      {
        path: "md-review/:id",
        element: (
          <Layout>
            <MdReviewBills />
          </Layout>
        ),
        handle: { title: "MD Review Details" },
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
      // State Routes
      {
        path: "state",
        children: [
          {
            path: "dashboard",
            element: (
              <Layout>
                <Dashboard />
              </Layout>
            ),
            handle: { title: "State Dashboard" },
          },
          {
            path: "providers/all",
            element: (
              <Layout>
                <AllProviders />
              </Layout>
            ),
            handle: { title: "All Providers" },
          },
          {
            path: "provider/registration",
            element: (
              <Layout>
                <RegisterProvider />
              </Layout>
            ),
            handle: { title: "Register Provider" },
          },
          {
            path: "provider/vetting",
            element: (
              <Layout>
                <StateClaims />
              </Layout>
            ),
            handle: { title: "Emergency Claims Vetting" },
          },
            {
            path: "provider/tracking",
            element: (
              <Layout>
                <ClaimsTracking />
              </Layout>
            ),
            handle: { title: "Claims Tracking" },
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);