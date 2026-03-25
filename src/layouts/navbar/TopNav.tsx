import React from "react";
import { HiMenu } from "react-icons/hi";
import { useProviderContext } from "../../context/useProviderContext";
import { useMatches } from "react-router-dom";
import FormHeader from "../../components/form/FormHeader";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import Select from "../../components/ui/Select";

interface TopNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

interface RouteHandle {
  title?: string;
}

const TopNav: React.FC<TopNavProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isSSHIA = user?.orgType === "SSHIA";

  const {
    providers,
    selectedProviderId,
    setSelectedProviderId,
    loading
  } = useProviderContext();

  const selectOptions = providers.map(p => ({
    value: p.id,
    label: p.hospitalName
  }));

  const matches = useMatches();

  const pageTitle = React.useMemo(() => {
    const matchedRoute = [...matches].reverse().find(
      (match) => (match.handle as RouteHandle)?.title
    );

    return (matchedRoute?.handle as RouteHandle)?.title || "Dashboard";
  }, [matches]);

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <HiMenu />
        </button>

        <FormHeader>{pageTitle}</FormHeader>
      </div>

      {/* Right */}
      {isSSHIA && (
        <div className="w-64">
          <Select
            options={selectOptions}
            value={selectedProviderId || ""}
            onChange={(val) => setSelectedProviderId(val || null)}
            placeholder={loading ? "Loading providers..." : "Choose a provider"}
          />
        </div>
      )}
    </header>
  );
};

export default TopNav;