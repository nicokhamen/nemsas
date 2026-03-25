import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../services/store/store';
import { useGetProvidersQuery } from '../services/slices/providerSlice';
import { ProviderContext } from './ProviderContextBase';
import type { Provider } from '../types/Provider';

export const ProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const isSSHIA = user?.orgType === 'SSHIA';
  const isProviderUser = user?.orgType === 'PROVIDER';

  // TTL for provider list cache (ms). 30 minutes.
  const CACHE_TTL = 30 * 60 * 1000;

  // Load cached providers from localStorage if fresh
  const initialProviders: Provider[] = (() => {
    try {
      const raw = localStorage.getItem('providersCache');
      if (!raw) return [];

      const parsed = JSON.parse(raw) as { timestamp: number; data: Provider[] };

      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return Array.isArray(parsed.data) ? parsed.data : [];
      }
    } catch {
      // ignore parse errors
    }

    return [];
  })();

  const [cachedProviders, setCachedProviders] = useState<Provider[]>(initialProviders);

  // ✅ KEY CHANGE: skip query if NOT SSHIA or already cached
  const shouldSkipQuery = !isSSHIA || cachedProviders.length > 0;

  // Fetch providers (only for SSHIA)
  const { data, isLoading, error } = useGetProvidersQuery(
    { pageSize: 100, pageNumber: 1 },
    { skip: shouldSkipQuery }
  );

  // Merge: prefer API data over cache
  const providers = useMemo<Provider[]>(() => {
    if (data?.data) return data.data;
    return cachedProviders;
  }, [data, cachedProviders]);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(() => {
    return localStorage.getItem('selectedProviderId');
  });

  /**
   * ✅ CRITICAL LOGIC
   * - Provider user → force their providerId
   * - SSHIA user → auto-select first provider if none selected
   */
  useEffect(() => {
    if (!user) return;

    if (isProviderUser) {
      // Provider should ALWAYS use their own providerId
      if (user.providerId && selectedProviderId !== user.providerId) {
        setSelectedProviderId(user.providerId);
      }
      return;
    }

    // SSHIA logic
    if (isSSHIA && !selectedProviderId && providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  }, [user, isProviderUser, isSSHIA, providers, selectedProviderId]);

  // Persist selected provider
  useEffect(() => {
    if (selectedProviderId) {
      localStorage.setItem('selectedProviderId', selectedProviderId);
    } else {
      localStorage.removeItem('selectedProviderId');
    }
  }, [selectedProviderId]);

  // Cache providers after fetch (SSHIA only)
  useEffect(() => {
    if (data?.data && isSSHIA) {
      setCachedProviders(data.data);

      try {
        localStorage.setItem(
          'providersCache',
          JSON.stringify({
            timestamp: Date.now(),
            data: data.data
          })
        );
      } catch {
        // ignore quota errors
      }
    }
  }, [data, isSSHIA]);

  return (
    <ProviderContext.Provider
      value={{
        providers: isSSHIA ? providers : [], // Providers don’t need full list
        selectedProviderId,
        setSelectedProviderId: isProviderUser
          ? () => {} // Prevent provider from changing it manually
          : setSelectedProviderId,
        loading: isSSHIA ? (!shouldSkipQuery && isLoading) : false,
        error: isSSHIA
          ? error
            ? 'status' in error
              ? `Error ${error.status}`
              : 'Failed to load providers'
            : null
          : null
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};