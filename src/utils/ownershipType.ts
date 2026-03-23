export const OwnershipType = {
  Public: "Public",
  Private: "Private",

} as const;

export type OwnershipType = (typeof OwnershipType)[keyof typeof OwnershipType];

// Dropdown options
export const ownershipTypeOptions = Object.values(OwnershipType).map(value => ({
  value,
  label: value,
}));