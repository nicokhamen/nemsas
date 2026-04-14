export type Role = 
  | "MD"
  | "ADMINISTRATOR"
  | "INDIVIDUAL"
  | "CORPORATE"
  | "SSHIA"
  | "PROVIDER"
  | "HMO"
  | "NHIA";

export type OrganizationType = 
  | "PROVIDER"
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