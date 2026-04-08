// Optional: restrict known values with unions
export type ClaimStatus = "New" | "Pending" | "Approved" | "Rejected";
export type ClaimType = "ETC" | "MEDICAL" | "DENTAL" | "OTHER"; 

export interface Claim {
  description: string;
  claimType: ClaimType;
  date: string; 
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  vettedAmount: number;
  submittedAmount: number;
  submittedDate: string;
  vettedDate: string;
  createdDate: string;
  isActive: boolean;
  providerId: string;
  sshiaId: string;
}

export interface ClaimsResponse {
  data: Claim[];
  message: string;
  isSuccess: boolean;
}