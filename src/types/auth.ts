export interface LoginCredentials {
  email: string;
  password: string;
}

export type OrganizationType = "PROVIDER" | "SSHIA";

export interface AuthUser {
  id: string;
  fullName: string;
  emailAddress: string;

  role: string;
  hmoId: string;
  isProvider: boolean;
  providerId: string;

  organizationId?: string;
  organization?: string;
  tenantId?: string;

  orgType: OrganizationType;
}

export interface LoginResponse {
  data: AuthUser & { token?: string; accessToken?: string };
  token?: string;
  accessToken?: string;
  message: string;
  isSuccess: boolean;
}
