// import { useState, useEffect } from 'react';
// import type { State } from '../../types/Country';
// import { fetchStatesByCountry } from '../../services/api/resourcesApi';

// export const useStates = (countryCode: string | null) => {
//   const [states, setStates] = useState<State[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadStates = async () => {
//       if (!countryCode) {
//         setStates([]);
//         return;
//       }
//       try {
//         setLoading(true);
//         setError(null);
//         const statesData = await fetchStatesByCountry(countryCode);
//         setStates(statesData);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//         setStates([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStates();
//   }, [countryCode]);

//   return { states, loading, error };
// };