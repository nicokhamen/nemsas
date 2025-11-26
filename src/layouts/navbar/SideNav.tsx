import React from "react";
import { Link, useLocation } from "react-router-dom";
// import Button from "../../components/ui/Button";
import { ADMIN_SIDEBAR, PROVIDER_SIDEBAR } from "../../constant/sideBarItems";
// import HimisLogo from "../../assets/himis-logo";
import SidebarDropdown from "../../components/ui/SidebarDropdown";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import nemsasImage from "../../assets/nemsas.jpg";
import { LogOut } from "lucide-react";

interface SideNavProps {
  sidebarOpen: boolean;
}

const SideNav: React.FC<SideNavProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();

  const location = useLocation();

  const sidebarItems = user?.isProvider ? PROVIDER_SIDEBAR : ADMIN_SIDEBAR;

  // Conditional header text based on user type
  // const headerText = user?.isProvider ? "Absolute Care" : "NEMSAS";

  const isActive = (path: string | undefined) => {
    return path && location.pathname === path;
  };

  // Sidebar check

  return (
    <>
      <aside className="w-64 bg-white text-gray-700 h-full flex flex-col font-avenir">
        <div className="relative">
          <div className="flex items-center justify-center p-4 gap-2">
            <img src={nemsasImage} alt="NEMSAS Logo" className="w-8 h-8" />
            <h1 className="text-xl text-[#DC2626] leading-tight">NEMSAS</h1>
          </div>
          <div className="absolute bottom-0 right-[20%]">
            <span
              className={`w-fit inline-flex items-center px-2 pb-0.5 rounded text-[10px] font-semibold tracking-wide uppercase shadow-sm
              ${
                user?.isProvider &&
                "bg-green-100 text-green-700 ring-1 ring-green-200"
              }`}
              title={
                user?.isProvider
                  ? "You are operating in a Provider context: submit and manage claims."
                  : "You are operating in an HMO context: review, adjudicate and oversee provider claims."
              }
            >
              {user?.isProvider && "Provider"}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 mt-2 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            if (item.children) {
              // Render dropdown for items with children
              return <SidebarDropdown key={index} item={item} />;
            } else {
              return (
                <Link
                  key={index}
                  to={item.path || "#"}
                  className={`flex items-center space-x-3 px-4 py-3 transition-colors duration-200 group ${
                    isActive(item.path)
                      ? " bg-[#DC2626] text-white"
                      : "hover:bg-[#B91C1C]  hover:text-white"
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
                    className={`transition-colors duration-200 ${
                      isActive(item.path)
                        ? "text-white"
                        : "group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }
          })}
        </nav>

        <div className="p-4 mt-auto">
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
