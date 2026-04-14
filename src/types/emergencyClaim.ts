// types/emergencyClaim.ts

export type ClaimType = 
  | "InpatientCare"
  | "OutpatientCare"
  | "Medication"
  | "Laboratory"
  | "Imaging"
  | "Surgery"
  | "EmergencyRoom"
  | "Ambulance";

export const ClaimType = {
  InpatientCare: "InpatientCare" as ClaimType,
  OutpatientCare: "OutpatientCare" as ClaimType,
  Medication: "Medication" as ClaimType,
  Laboratory: "Laboratory" as ClaimType,
  Imaging: "Imaging" as ClaimType,
  Surgery: "Surgery" as ClaimType,
  EmergencyRoom: "EmergencyRoom" as ClaimType,
  Ambulance: "Ambulance" as ClaimType,
} as const;

export type ClaimStatus = 
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Processing"
  | "Paid"
  | "RequiresMoreInfo";

export const ClaimStatus = {
  Pending: "Pending" as ClaimStatus,
  Approved: "Approved" as ClaimStatus,
  Rejected: "Rejected" as ClaimStatus,
  Processing: "Processing" as ClaimStatus,
  Paid: "Paid" as ClaimStatus,
  RequiresMoreInfo: "RequiresMoreInfo" as ClaimStatus,
} as const;

export interface EmergencyClaim {
  id: string;
  description: string;
  claimType: ClaimType;
  claimNumber: string,
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

export interface EmergencyClaimResponse {
  data: EmergencyClaim[];
  message: string;
  isSuccess: boolean;
}

export interface EmergencyClaimRequest {
  providerId: string;
  SSHIAId: string;
  status?: string;
}

export interface CreateEmergencyClaimRequest {
  description: string;
  claimType: ClaimType;
  date: string;
  submittedAmount: number;
  emergencyBillIds: string[];
  providerId: string;
  sshiaId: string;
}

export interface UpdateEmergencyClaimRequest extends Partial<CreateEmergencyClaimRequest> {
  id: string;
}

export interface DeleteEmergencyClaimRequest {
  id: string;
  providerId: string;
  SSHIAId: string;
}