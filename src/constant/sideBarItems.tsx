import React from "react";
import DashboardIcon from "../assets/sidebar-icons/dashboard-icon";
import EnrolleeIcon from "../assets/sidebar-icons/enrollee-icon";
import SettingsIcon from "../assets/sidebar-icons/settings-icon";

export interface SidebarItem {
  icon: React.ReactNode | null;
  label: string;
  active: boolean;
 
  path?: string;
  children?: SidebarItem[];
}

// Admin Sidebar
export const ADMIN_SIDEBAR: SidebarItem[] = [
  {
    icon: <DashboardIcon className="w-5 h-5" />,
    label: "Dashboard",
    active: false,
    path: "/nemsas/dashboard"
  },

  {
    icon: <EnrolleeIcon className="w-5 h-5" />,
    label: "Providers",
    active: false,
    children: [
      { icon: null, label: "All Providers", active: false, path: "/nemsas/providers/all" },
      { icon: null, label: "Providers Registration", active: false, path: "/nemsas/provider/registration" }
    ]
  },
  {
    icon: <EnrolleeIcon className="w-5 h-5" />,
    label: "Nemsas",
    active: false,
    children: [
      { icon: null, label: "Emergency Claims Vetting", active: false, path: "/nemsas/vetting/claims" },
      { icon: null, label: "Authorization", active: false, path: "/nemsas/payments/authorization" },
      { icon: null, label: "Tracker", active: false, path: "/nemsas/payments/tracker" }
    ]
  },
    {
    icon: <EnrolleeIcon className="w-5 h-5" />,
    label: "Reports",
    active: false,
    children: [
      { icon: null, label: "Claims History", active: false, path: "/reports/claims-history" },
      { icon: null, label: "Payments History", active: false, path: "/reports/payments-history" },
    
    ]
  },
   {
    icon: <SettingsIcon className="w-5 h-5" />,
    label: "Settings",
    active: false,
 
  }
];

// Provider Sidebar
export const PROVIDER_SIDEBAR: SidebarItem[] = [
  // {  icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard", active: false, path: "/enrollee/dashboard" },
   {
    icon: <EnrolleeIcon className="w-5 h-5" />,
    label: "Claims",
    active: false,
    children: [
      { icon: null, label: "Claims Management", active: false, path: "/claims" },
      { icon: null, label: "Emergency Bill Centre", active: false, path: "/nemsas-management" }
    ]
  },
  // { icon: <EnrolleeIcon className="w-5 h-5" />, label: "Enrollee Management", active: false, path: "/enrollee-management" },
  { icon: <SettingsIcon className="w-5 h-5" />, label: "Settings", active: false, path: "/settings"  },
  {  icon: <SettingsIcon className="w-5 h-5" />, label: "Tariff", active: false, path: "/tariff"  },
];
