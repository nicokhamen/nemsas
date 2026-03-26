import React from "react";
import DashboardIcon from "../assets/sidebar-icons/dashboard-icon";
import EnrolleeIcon from "../assets/sidebar-icons/enrollee-icon";
import SettingsIcon from "../assets/sidebar-icons/settings-icon";
import ClaimsIcon from "../assets/sidebar-icons/claims-icon";
import SettlementIcon from "../assets/sidebar-icons/settlement-icon";
import TariffIcon from "../assets/sidebar-icons/tarrif-icon";


export interface SidebarItem {
  icon?: React.ReactNode | null;
  label: string;
  active?: boolean;

  path?: string;
  children?: SidebarItem[];
}

// Admin Sidebar
export const STATE_SIDEBAR: SidebarItem[] = [
  {
    icon: <DashboardIcon className="w-5 h-5" />,
    label: "Dashboard",
    active: false,
    // path: "/state/dashboard"
  },
  {
  icon: <ClaimsIcon className="w-5 h-5" />,
  label: "Claims",
  active: false,
  children: [
    {
      label: "NEMSAS",
      children: [
        { label: "All Providers", path: "/state/providers/all" },
        { label: "Register Provider", path: "/state/provider/registration" },
         { label: "Claims Vetting", path: "/state/provider/vetting", },
        { label: "Claims Tracking", path: "/state/provider/tracking", }
      ]
    }
  ]
},
 {
    icon: <SettingsIcon className="w-5 h-5" />,
    label: "Settlement",
    active: false,

  },
   {
    icon: <SettingsIcon className="w-5 h-5" />,
    label: "Tariff",
    active: false,

  },

 

 
  {
    icon: <SettingsIcon className="w-5 h-5" />,
    label: "Settings",
    active: false,

  }
];

// Provider Sidebar
export const PROVIDER_SIDEBAR: SidebarItem[] = [
  {  icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard", active: false},
{
  icon: <ClaimsIcon className="w-5 h-5" />,
  label: "Claims",
  active: false,
  children: [
    {
      label: "NEMSAS",
      children: [
        { label: "Emergency Bill", path: "/emergency/bills" },
        { label: "Claims Management", path: "/claims-management" }
      ]
    }
  ]
},
  { icon: <ClaimsIcon className="w-5 h-5" />, label: "MD Review & Endorsement", active: false, path: "/md-review" },
  { icon: <SettlementIcon className="w-5 h-5" />, label: "Settlement", active: false },
  { icon: <TariffIcon className="w-5 h-5" />, label: "Tariff", active: false, path: "/tariff" },
  { icon: <SettingsIcon className="w-5 h-5" />, label: "Settings", active: false, path: "/settings" },
];
