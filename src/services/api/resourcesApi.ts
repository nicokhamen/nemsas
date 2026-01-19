// import type { ApiResponse, Country, State } from "../../types/Country";
// import type { IEnrolleeClassResponse } from "../../types/EnrolleeClass";

// import type {  IEnrolleeTypeResponse } from "../../types/EnrolleeType";
// // import type { IPlanTypeResponse } from "../../types/PlanType";
// import type { IGender, IMaritalStatuses, IPlanTypeResponse, IRelationship } from "../../types/resources";
// import { formatApiError } from "../../utils/errorFormatter";
// import axiosInstance from "../../config/axiosInstance";
// import type {  MemberType,  MemberTypesResponse } from "../../types/MemberType";
// import type { PlanTypeResponse } from "../../types/planTypeId";

// const RESOURCES_BASE = "/resources";
// const SETTINGS_BASE = "/settings";

// export const fetchGenders = async (): Promise<string[]> => {
//   try {
//     const response = await axiosInstance.get<IGender>(`${RESOURCES_BASE}/genders`);
//     return response.data.data;
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error fetching genders:", message);
//     throw new Error(message);
//   }
// };

// export const fetchMaritalStatus = async (): Promise<string[]> => {
//   try {
//     const response = await axiosInstance.get<IMaritalStatuses>(`${RESOURCES_BASE}/marital-statuses`);
//     return response.data.data;
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error fetching marital statuses:", message);
//     throw new Error(message);
//   }
// };

// export const fetchRelationships = async (): Promise<string[]> => {
//   try {
//     const response = await axiosInstance.get<IRelationship>(`${RESOURCES_BASE}/relationships`);
//     return response.data.data;
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error Relationships:", message);
//     throw new Error(message);
//   }
// };

// export const fetchCountries = async (): Promise<Country[]> => {
//   try {
//     const response = await axiosInstance.get<ApiResponse<Country[]>>(
//       `${RESOURCES_BASE}/countries`
//     );

//     if (response.data.isSuccess) {
//       // console.log(response.data)
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error fetching countries:", message);
//     throw new Error(message);
//   }
// };

// export const fetchStatesByCountry = async (countryCode: string): Promise<State[]> => {
//   try {
//     const response = await axiosInstance.get<ApiResponse<State[]>>(
//       `${RESOURCES_BASE}/states/country?countryCode=${countryCode}`
//     );

//     if (response.data.isSuccess) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//        const message = formatApiError(error);
//     console.error("Error fetching countries:", message);
//     throw new Error(message);
//   }
// };


// export const fetchEnrolleeType = async (): Promise<{id: string, name: string}[]> => {
//   try {
//     const response = await axiosInstance.get<IEnrolleeTypeResponse>(
//       `${SETTINGS_BASE}/enrollee-type`
//     );

//     if (response.data.isSuccess) {
 
//       return response.data.data.map((enrollee) => ({
//         id: enrollee.id,
//         name: enrollee.name
//       })); 
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error fetching enrollee types:", message);
//     throw new Error(message);
//   }
// };

// export const fetchEnrolleeClass = async (): Promise<{id: string, name: string}[]> => {
//   try {
//     const response = await axiosInstance.get<IEnrolleeClassResponse>(
//       `${SETTINGS_BASE}/enrollee-class`
//     );

//     if (response.data.isSuccess) {
     
//       return response.data.data.map((enrollee) => ({
//         id: enrollee.id,
//         name: enrollee.name
//       })); 
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error fetching enrollee class:", message);
//     throw new Error(message);
//   }
// };

// export const fetchPlanTypes = async (): Promise<{id: string, name: string}[]> => {
//   try {
//     const response = await axiosInstance.get<IPlanTypeResponse>(
//       `${SETTINGS_BASE}/plan-types`
//     );

//     if (response.data.isSuccess) {
     
//       return response.data.data.map((planType) => ({
//         id: planType.id,
//         name: planType.name
//       })); 
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error fetching planType:", message);
//     throw new Error(message);
//   }
// };

// export const fetchPlanTypeById = async (planTypeId: string): Promise<PlanTypeResponse['data']> => {
//   try {
//     const response = await axiosInstance.get<PlanTypeResponse>(`${SETTINGS_BASE}/plan-detail/plan-type/${planTypeId}`);
//     return response.data.data;
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error(`Error fetching plan type with ID ${planTypeId}:`, message);
//     throw new Error(message);
//   }
// };


// export const fetchMemberTypes = async (): Promise<MemberType[]> => {
//   try {
//     const response = await axiosInstance.get<MemberTypesResponse>(
//       `${SETTINGS_BASE}/plan-details`
//     );

//     if (response.data.isSuccess) {
//       return response.data.data
//         .map((item) => item.memberType)
//         .filter((memberType): memberType is MemberType => Boolean(memberType))
//         .map((memberType) => ({
//           id: memberType.id, 
//           name: memberType.name,
//           description: memberType.description
//         }));
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error Member-types", message);
//     throw new Error(message);
//   }
// };

// export const fetchBillingFrequency = async (): Promise<string[]> => {
//   try {
//     const response = await axiosInstance.get<MemberTypesResponse>(
//       `${SETTINGS_BASE}/plan-details`
//     );

//     if (response.data.isSuccess) {
//       const frequencies = response.data.data
//         .filter((item) => item.isActive && item.billingFrequency)
//         .map((item) => item.billingFrequency);

//       // return unique values
//       return Array.from(new Set(frequencies));
//     } else {
//       throw new Error(response.data.message);
//     }
//   } catch (error: unknown) {
//     const message = formatApiError(error);
//     console.error("Error Billing Frequency", message);
//     throw new Error(message);
//   }
// };

