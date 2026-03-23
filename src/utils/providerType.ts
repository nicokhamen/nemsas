export const ProviderType = {
  General: "General",
  NHIA: "NHIA",
  SSHIA: "SSHIA"
} as const;

export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];

// Dropdown options
export const providerTypeOptions = Object.values(ProviderType).map(value => ({
  value,
  label: value,
}));