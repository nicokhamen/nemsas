import { useContext } from 'react';
import { ProviderContext } from './ProviderContextBase';

// export const useProviderContext = () => {
//   const ctx = useContext(ProviderContext);
//   if (!ctx) throw new Error('useProviderContext must be used within ProviderProvider');
//   return ctx;
// };

export const useProviderContext = () => {
  const context = useContext(ProviderContext);

  if (!context) {
    // DO NOT crash app
    return {
      providers: [],
      selectedProviderId: null,
      setSelectedProviderId: () => {},
      loading: false,
      error: null,
    };
  }

  return context;
};