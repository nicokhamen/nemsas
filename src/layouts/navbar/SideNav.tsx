import React from "react";
import { Link, useLocation } from "react-router-dom";
import { STATE_SIDEBAR, PROVIDER_SIDEBAR } from "../../constant/sideBarItems";
import SidebarDropdown from "../../components/ui/SidebarDropdown";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import nemsasImage from "../../assets/nemsas.jpg";
import { LogOut } from "lucide-react";
import { useProviderContext } from "../../context/useProviderContext";

interface SideNavProps {
  sidebarOpen: boolean;
}

const SideNav: React.FC<SideNavProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const location = useLocation();

  // Only use provider context if SSHIA
  const { providers, selectedProviderId } = useProviderContext();

  // Determine org type safely
  const isProvider = user?.orgType === "PROVIDER";
  const isSSHIA = user?.orgType === "SSHIA";

  // Sidebar switching (CORE LOGIC)
  const sidebarItems = isProvider ? PROVIDER_SIDEBAR : STATE_SIDEBAR;

  // Get selected provider (only relevant for SSHIA)
  const loggedProvider = providers?.find(
    (p) => p.id === selectedProviderId
  );

  const isActive = (path?: string) => {
    return path && location.pathname === path;
  };

  // ❗ Guard: no user yet
  if (!user) return null;

  return (
    <aside className="w-64 bg-white text-gray-700 h-full flex flex-col font-avenir flex-shrink-0 min-w-[256px] max-w-[256px] overflow-hidden">
      
      {/* HEADER */}
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-center p-4 gap-2">
          <img src={nemsasImage} alt="NEMSAS Logo" className="w-8 h-8" />
          <h1 className="text-xl text-[#DC2626] leading-tight">NEMSAS</h1>
        </div>

        {/* ORG BADGE */}
        <div className="absolute bottom-0 right-[20%]">
          <span
            className={`w-fit inline-flex items-center px-2 pb-0.5 rounded text-[10px] font-semibold tracking-wide uppercase shadow-sm
              ${
                isProvider
                  ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                  : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
              }`}
            title={
              isProvider
                ? "Provider: submit and manage claims"
                : "SSHIA: review and oversee provider claims"
            }
          >
            {/* Label logic */}
            {isProvider
              ? "Provider"
              : loggedProvider?.hospitalName || "SSHIA"}
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
  );
};

export default SideNav;