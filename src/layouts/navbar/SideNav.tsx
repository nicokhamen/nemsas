import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  STATE_SIDEBAR, 
  PROVIDER_SIDEBAR, 
  ADMIN_SIDEBAR, MD_SIDEBAR,
  type SidebarItem  // Import the existing type
} from "../../constant/sideBarItems";
import SidebarDropdown from "../../components/ui/SidebarDropdown";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import nemsasImage from "../../assets/nemsas.jpg";
import { LogOut } from "lucide-react";
import { useProviderContext } from "../../context/useProviderContext";
import { normalizeOrgType } from "../../utils/normalizerOrg";

interface SideNavProps {
  sidebarOpen: boolean;
}

// Badge color mapping
const getBadgeStyles = (orgType: string): string => {
  const styles: Record<string, string> = {
    PROVIDER: "bg-green-100 text-green-700 ring-1 ring-green-200",
    SSHIA: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    ADMINISTRATIVE: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  };
  return styles[orgType] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
};

// Badge label mapping
const getBadgeLabel = (orgType: string, providerName?: string): string => {
  const labels: Record<string, string> = {
    PROVIDER: "Provider",
    SSHIA: providerName || "SSHIA",
    ADMINISTRATIVE: "Admin",
  };
  return labels[orgType] || orgType;
};

// Badge tooltip mapping
const getBadgeTooltip = (orgType: string): string => {
  const tooltips: Record<string, string> = {
    PROVIDER: "Provider: submit and manage claims",
    SSHIA: "SSHIA: review and oversee provider claims",
    ADMINISTRATIVE: "Administrative: system management and oversight",
  };
  return tooltips[orgType] || `${orgType} role`;
};

const SideNav: React.FC<SideNavProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const location = useLocation();

  // Only use provider context if SSHIA
  const { providers, selectedProviderId } = useProviderContext();

  const orgType = normalizeOrgType(user?.orgType);

  // Role-based sidebar mapping (BEST PRACTICE)
 const SIDEBAR_MAP: Record<string, SidebarItem[]> = {
  PROVIDER: PROVIDER_SIDEBAR,
  SSHIA: STATE_SIDEBAR,
  ADMINISTRATIVE: ADMIN_SIDEBAR,
};

// const sidebarItems = SIDEBAR_MAP[orgType] || [];

const role = user?.role;

const getSidebarItems = (): SidebarItem[] => {
  switch (orgType) {
    case "PROVIDER":
      if (role === "MD") {
        return MD_SIDEBAR; // ✅ MD ONLY
      }

      return PROVIDER_SIDEBAR; // ✅ ADMIN PROVIDER

    case "SSHIA":
      return STATE_SIDEBAR;

    case "ADMINISTRATIVE":
      return ADMIN_SIDEBAR;

    default:
      return [];
  }
};

const sidebarItems = getSidebarItems();

  // Get selected provider (only relevant for SSHIA)
  const loggedProvider = providers?.find(
    (p) => p.id === selectedProviderId
  );

  const isActive = (path?: string) => {
    return path && location.pathname === path;
  };

  // Get org type safely
  // const orgType = user?.orgType || "";
  
  // Get provider name for badge (only used for SSHIA)
  const providerName = orgType === "SSHIA" ? loggedProvider?.hospitalName : undefined;

  // ❗ Guard: no user yet
  if (!user) return null;

  return (
    <>
      <aside className="w-64 bg-white text-gray-700 h-full flex flex-col font-avenir flex-shrink-0 min-w-[256px] max-w-[256px] overflow-hidden">
        
        {/* HEADER */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center justify-center p-4 gap-2">
            <img src={nemsasImage} alt="NEMSAS Logo" className="w-8 h-8" />
            <h1 className="text-xl text-[#DC2626] leading-tight">NEMSAS</h1>
          </div>

          {/* ORG BADGE - Dynamic based on role */}
          <div className="absolute bottom-0 right-[20%]">
            <span
              className={`w-fit inline-flex items-center px-2 pb-0.5 rounded text-[10px] font-semibold tracking-wide uppercase shadow-sm ${getBadgeStyles(orgType)}`}
              title={getBadgeTooltip(orgType)}
            >
              {getBadgeLabel(orgType, providerName)}
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 mt-2 overflow-y-auto min-h-0">
          {sidebarItems.map((item, index) => {
            if (item.children) {
              return <SidebarDropdown key={index} item={item} />;
            }

            return (
              <Link
                key={index}
                to={item.path || "#"}
                className={`flex items-center space-x-3 px-4 py-3 transition-colors duration-200 group ${
                  isActive(item.path)
                    ? "bg-[#DC2626] text-white"
                    : "hover:bg-[#B91C1C] hover:text-white"
                }`}
              >
                <span
                  className={`text-xl transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-white"
                      : "group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>

                <span
                  className={`transition-colors duration-200 truncate ${
                    isActive(item.path)
                      ? "text-white"
                      : "group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 🔻 FOOTER */}
        <div className="p-4 mt-auto flex-shrink-0">
          <button
            className="w-full justify-center flex items-center gap-2 text-[#DC2626] hover:bg-red-50 rounded-md p-2 transition-colors"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;