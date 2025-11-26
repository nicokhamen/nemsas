export const InsuranceType = {
  NHIA: "NHIA",
  SSHIA: "SSHIA",
} as const;

export type InsuranceType = (typeof InsuranceType)[keyof typeof InsuranceType];

// Dropdown options
export const insuranceTypeOptions = Object.values(InsuranceType).map(value => ({
  value,
  label: value,
}));