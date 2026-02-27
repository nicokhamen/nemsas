import React from "react";
// import Select from "../../components/ui/Select";
import { HiMenu } from "react-icons/hi";
import { useProviderContext } from "../../context/useProviderContext";

interface TopNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ sidebarOpen, setSidebarOpen }) => {
  // const { providers, selectedProviderId, setSelectedProviderId, loading } = useProviderContext();
  const { providers } = useProviderContext();
  // const selectOptions = providers.map(p => ({ value: p.id, label: p.hospitalName }));

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <HiMenu />
        </button>
        {/* <h2 className="text-lg font-semibold">Dashboard</h2> */}
      </div>

      {/* Right side */}
      {/* <div className="w-64">
        <Select
          options={selectOptions}
          value={selectedProviderId || ''}
          onChange={(val) => setSelectedProviderId(val || null)}
          placeholder={loading ? "Loading providers..." : "Choose a provider"}
        />
      </div> */}
    </header>
  );
};

export default TopNav;
