export type EmergencyClaimStatus =
  | 'New'
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

// Type for vetting Claim in the State section
export type VettingClaim = {
  emergencyClaimId: string;
  remark: string;
  status: "New";
};

export type VettingClaimResponse = {
  success: boolean;
  message: string;
  data: VettingClaim;
};