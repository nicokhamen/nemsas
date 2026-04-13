import type { Role } from "../types/roles";

export const isRole = (value: string): value is Role => {
  const validRoles: Role[] = [
    "MD",
    "ADMINISTRATOR", 
    "INDIVIDUAL",
    "CORPORATE",
    "SSHIA",
    "PROVIDER",
    "HMO",
    "NHIA"
  ];
  return validRoles.includes(value as Role);
};

export const normalizeRole = (role?: string): Role => {
  if (!role) return "INDIVIDUAL";
  
  const r = role.toLowerCase();
  
  if (r.includes("md")) return "MD";
  if (r.includes("provider")) return "PROVIDER";
  if (r.includes("admin")) return "ADMINISTRATOR";
  if (r.includes("sshia")) return "SSHIA";
  if (r.includes("nhia")) return "NHIA";
  if (r.includes("hmo")) return "HMO";
  if (r.includes("corporate")) return "CORPORATE";
  if (r.includes("individual")) return "INDIVIDUAL";
  
  return "INDIVIDUAL";
};

export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case "ADMINISTRATOR":
      return "/admin/dashboard";
    case "SSHIA":
    case "NHIA":
      return "/state/dashboard";
    case "PROVIDER":
    case "MD":
      return "/provider/dashboard";
    case "HMO":
      return "/hmo/dashboard";
    case "INDIVIDUAL":
    case "CORPORATE":
      return "/enrollee/dashboard";
    default:
      return "/dashboard";
  }
};