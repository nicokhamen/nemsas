// import { useState, useEffect, useRef, useCallback } from 'react';
// import { type PlanTypeData } from "../../types/planTypeId";
// import { fetchPlanTypeById } from '../../services/api/resourcesApi';

// interface UsePlanTypeByIdOptions {
//   enabled?: boolean;
//   onSuccess?: (data: PlanTypeData) => void;
//   onError?: (error: string) => void;
// }

// interface UsePlanTypeByIdResult {
//   planType: PlanTypeData | null;
//   loading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
//   isFetched: boolean;
// }

// export const usePlanTypeById = (
//   planTypeId: string | null, 
//   options: UsePlanTypeByIdOptions = {}
// ): UsePlanTypeByIdResult => {
//   const { enabled = true, onSuccess, onError } = options;
//   const [planType, setPlanType] = useState<PlanTypeData | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isFetched, setIsFetched] = useState<boolean>(false);
//   const abortControllerRef = useRef<AbortController | null>(null);

//   // Wrap fetchData in useCallback to stabilize the function reference
//   const fetchData = useCallback(async (id: string) => {
//     // Cancel previous request
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     abortControllerRef.current = new AbortController();
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const data = await fetchPlanTypeById(id);
//       setPlanType(data);
//       setIsFetched(true);
//       onSuccess?.(data);
//     } catch (err) {
//       // Ignore abort errors
//       if (err instanceof Error && err.name === 'AbortError') {
//         return;
//       }
      
//       const errorMessage = err instanceof Error ? err.message : 'An error occurred';
//       setError(errorMessage);
//       setPlanType(null);
//       onError?.(errorMessage);
//     } finally {
//       setLoading(false);
//       abortControllerRef.current = null;
//     }
//   }, [onSuccess, onError]); // Add dependencies that fetchData uses

//   const refetch = useCallback(async () => {
//     if (planTypeId) {
//       await fetchData(planTypeId);
//     }
//   }, [planTypeId, fetchData]);

//   useEffect(() => {
//     if (planTypeId && enabled) {
//       fetchData(planTypeId);
//     } else if (!planTypeId) {
//       setPlanType(null);
//       setLoading(false);
//       setError(null);
//     }

//     // Cleanup function to cancel ongoing request
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [planTypeId, enabled, fetchData]); 

//   return { planType, loading, error, refetch, isFetched };
// };