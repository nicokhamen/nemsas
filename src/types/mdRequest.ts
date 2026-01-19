export type EmergencyClaimStatus =
//   | 'Pending'
  | 'Approved'
  | 'Rejected';

export interface mdVetRequest {
  emergencyClaimId: string;
  emergencyBillIds: string[];
  remark?: string;
  status: EmergencyClaimStatus;
  isBillOnly: boolean;
  vettedAmount: number;
}

export interface ApiResponse<T = boolean> {
  data: T;
  message: string;
  isSuccess: boolean;
}