export const InsuranceType = {
  NHIA: "NHIA",
  SSHIAS: "SSHIAS",
} as const;

export type InsuranceType = (typeof InsuranceType)[keyof typeof InsuranceType];

// Dropdown options
// export const insuranceTypeOptions = Object.values(InsuranceType).map(value => ({
//   value,
//   label: value,
// }));

export const insuranceTypeOptions = [
  { value: InsuranceType.NHIA, label: "NHIA" },
  { value: InsuranceType.SSHIAS, label: "SSHIA" }, // Display as SSHIA
];