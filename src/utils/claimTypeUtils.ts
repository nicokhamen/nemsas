export const ClaimType = {
  ETC: "ETC",
  EMS: "EMS"
  
} as const;

export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];

// Dropdown options
export const claimTypeOptions = Object.values(ClaimType).map(value => ({
  value,
  label: value,
}));