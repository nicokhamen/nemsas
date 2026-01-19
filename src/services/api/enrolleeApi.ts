// import axiosInstance from '../../config/axiosInstance';
// import type { EnrolleeListResponse, EnrolleeDetailResponse, AuthorizationRequestPayload, AuthorizationResponse } from '../../types/Enrollee';

// export interface GetEnrolleesParams {
//   HMOId?: string;
//   EnrolleeNumber?: string;
//   EnrolleeName?: string;
//   PageNumber?: number;
//   PageSize?: number;
// }

// export const getEnrollees = async (params: GetEnrolleesParams) => {
//   const res = await axiosInstance.get<EnrolleeListResponse>('/enrollees', { params });
//   return res.data;
// };

// export const getEnrolleeById = async (id: string) => {
//   const res = await axiosInstance.get<EnrolleeDetailResponse>(`/enrollees/${id}`);
//   return res.data;
// };

// export const activateEnrollee = async (id: string) => {
//   const res = await axiosInstance.post(`/enrollees/${id}/activate`);
//   return res.data;
// };

// export const deactivateEnrollee = async (id: string) => {
//   const res = await axiosInstance.post(`/enrollees/${id}/deactivate`);
//   return res.data;
// };

// export const exportEnrolleesReport = async (params: { startDate: string; endDate: string; isExcel?: boolean }) => {
//   const res = await axiosInstance.get(`/reports/enrollees`, {
//     params: { ...params, IsExcel: params.isExcel },
//     responseType: 'blob'
//   });
//   return res.data as Blob;
// };

// export const submitAuthorization = async (payload: AuthorizationRequestPayload) => {
//   const formData = new FormData();
//   Object.entries(payload).forEach(([k, v]) => {
//     if (v === undefined || v === null) return;
//     if (k === 'Attachments' && Array.isArray(v)) {
//       v.forEach(f => formData.append('Attachments', f));
//     } else if (k === 'ReferralLetter' && v instanceof File) {
//       formData.append('ReferralLetter', v);
//     } else {
//       formData.append(k, v as string);
//     }
//   });
//   const res = await axiosInstance.post<AuthorizationResponse>('/authorizations', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
//   return res.data;
// };
