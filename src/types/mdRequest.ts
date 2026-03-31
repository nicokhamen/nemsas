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
  status: string;
};

export type VettingClaimResponse = {
  success: boolean;
  message: string;
  data: VettingClaim;
};

//  For Rejecting and Disputing Bills
export type SubmitVettingBillPayload = {
  emergencyBillId: string;
  remark?: string;
  status: "New" | "Rejected" | "Disputed";
};
export type VettingBill = {
  emergencybillId: string;
  remark: string;
  status: string;
};

export type VettingBillResponse = {
  success: boolean;
  message: string;
  data: VettingBill;
};