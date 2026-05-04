import type { Role } from "../types/roles";

export const isRole = (value: string): value is Role => {
  const validRoles: Role[] = [
    "MD",
    "Administrator", 
    "Individual",
    "Corporate",
    "SSHIA",
    "Provider",
    "HMO",
    "NHIA"
  ];
  return validRoles.includes(value as Role);
};

export const normalizeRole = (role?: string): Role => {
  if (!role) return "Individual";
  
  const r = role.toLowerCase();
  
  if (r.includes("md")) return "MD";
  if (r.includes("provider")) return "Provider";
  if (r.includes("admin")) return "Administrator";
  if (r.includes("sshia")) return "SSHIA";
  if (r.includes("nhia")) return "NHIA";
  if (r.includes("hmo")) return "HMO";
  if (r.includes("corporate")) return "Corporate";
  if (r.includes("individual")) return "Individual";
  
  return "Individual";
};

export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case "SuperAdmin":
      return "/admin/dashboard";
    case "Administrator":
      return "/admin/dashboard";
    case "SSHIA":
    case "NHIA":
      return "/state/dashboard";
    case "Provider":
      return "/emergency/bills";
    case "MD":
      return "/dashboard";
    case "HMO":
      return "/hmo/dashboard";
    case "Individual":
    case "Corporate":
      return "/enrollee/dashboard";
    default:
      return "/dashboard";
  }
};
