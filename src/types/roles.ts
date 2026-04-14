export type Role = 
  | "MD"
  | "Administrator"
  | "SuperAdmin"
  | "Individual"
  | "Corporate"
  | "SSHIA"
  | "Provider"
  | "HMO"
  | "NHIA";

export type OrganizationType = 
  | "Provider"
  | "SSHIA"
  | "Administrative"
  | "Individual";

export interface AuthUser {
  id: string;
  fullName: string;
  emailAddress: string;
  role: Role;
  hmoId?: string;
  isProvider?: boolean;
  providerId?: string;
  organization?: string;
  orgType: OrganizationType;
}