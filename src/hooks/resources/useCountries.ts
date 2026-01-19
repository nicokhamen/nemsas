// import { useState, useEffect } from 'react';
// import type { Country } from '../../types/Country';
// import { fetchCountries } from '../../services/api/resourcesApi';


// export const useCountries = () => {
//   const [countries, setCountries] = useState<Country[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadCountries = async () => {
//       try {
//         setLoading(true);
//         const countriesData = await fetchCountries();
//         setCountries(countriesData);
//         setError(null);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCountries();
//   }, []);

//   return { countries, loading, error };
// };