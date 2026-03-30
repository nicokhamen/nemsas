// utils/normalizeOrgType.ts
export const normalizeOrgType = (orgType?: string): string => {
  return orgType?.toUpperCase?.() || "";
};