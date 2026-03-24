import React from "react";
// import Select from "../../components/ui/Select";
import { HiMenu } from "react-icons/hi";
import { useProviderContext } from "../../context/useProviderContext";
import { useMatches } from "react-router-dom";
import FormHeader from "../../components/form/FormHeader";

interface TopNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

interface RouteHandle {
  title?: string;
}

const TopNav: React.FC<TopNavProps> = ({ sidebarOpen, setSidebarOpen }) => {
  // const { providers, selectedProviderId, setSelectedProviderId, loading } = useProviderContext();
  const { providers } = useProviderContext();
  // const selectOptions = providers.map(p => ({ value: p.id, label: p.hospitalName }));
  const matches = useMatches();

   // Find the deepest matched route with a title in its handle
  const pageTitle = React.useMemo(() => {
    // Reverse to get deepest match first
    const matchedRoute = [...matches].reverse().find(
      (match) => (match.handle as RouteHandle)?.title
    );
    
    return (matchedRoute?.handle as RouteHandle)?.title || "Dashboard";
  }, [matches]);
  

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
       <FormHeader>{pageTitle}</FormHeader>
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
