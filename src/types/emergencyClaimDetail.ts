// emergencyClaimDetail.ts
export type ClaimType = 
  | "InpatientCare"
  | "OutpatientCare"
  | "Medication"
  | "Laboratory"
  | "Imaging"
  | "Surgery"
  | "EmergencyRoom"
  | "Ambulance";

export type ClaimStatus = 
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Processing"
  | "Paid"
  | "RequiresMoreInfo";

export interface EmergencyClaimDetail {
  id: string;
  description: string;
  claimType: ClaimType;
  date: string;
  submittedAmount: number;
  emergencyBillIds: string[];
  status: ClaimStatus;
  vettedAmount: number;
  vettedDate: string;
  createdDate: string;
  isActive: boolean;
  providerId: string;
  sshiaId: string;
}

export interface EmergencyClaimDetailResponse {
  data: EmergencyClaimDetail;
  message: string;
  isSuccess: boolean;
}

export interface EmergencyClaimDetailRequest {
  id: string;
}


export const ClaimTypeOptions: Record<ClaimType, string> = {
  InpatientCare: "Inpatient Care",
  OutpatientCare: "Outpatient Care",
  Medication: "Medication",
  Laboratory: "Laboratory",
  Imaging: "Imaging",
  Surgery: "Surgery",
  EmergencyRoom: "Emergency Room",
  Ambulance: "Ambulance"
};

export const ClaimStatusOptions: Record<ClaimStatus, string> = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Processing: "Processing",
  Paid: "Paid",
  RequiresMoreInfo: "Requires More Info"
};