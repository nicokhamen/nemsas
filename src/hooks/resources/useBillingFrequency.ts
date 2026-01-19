// import { useState, useEffect } from "react";
// import { fetchBillingFrequency } from "../../services/api/resourcesApi";


// export const useBillingFrequency = () => {
//   const [billingFrequency, setBillingFrequency] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadBillingFrequency = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await fetchBillingFrequency();
//         setBillingFrequency(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "An error occurred");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadBillingFrequency();
//   }, []);

//   return { billingFrequency, loading, error };
// };
