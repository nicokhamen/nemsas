// to be deleted
// import { useState, useEffect } from "react";
// import { fetchMemberTypes } from "../../services/api/resourcesApi";
// import type {  MemberType } from "../../types/MemberType";

// export const useMemberTypes = () => {
//   const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadMemberTypes = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await fetchMemberTypes();
//         setMemberTypes(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "An error occurred");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMemberTypes();
//   }, []);

//   return { memberTypes, loading, error };
// };
