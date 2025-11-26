export const GenderType = {
  Male: "Male",
  Female: "Female",
} as const;

export type GenderType = (typeof GenderType)[keyof typeof GenderType];

// Dropdown options
export const genderTypeOptions = Object.values(GenderType).map(value => ({
  value,
  label: value,
}));