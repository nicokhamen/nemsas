export const AccountType = {
  Domiciliary: "Domiciliary",
  Current: "Current",
  FixedDeposit: "FixedDeposit",
  Joint: "Joint",
  Savings: "Savings",
  Corporate: "Corporate",
  NonResidentNigerian: "NonResidentNigerian",
} as const;

export type AccountType =
  (typeof AccountType)[keyof typeof AccountType];

// Dropdown options
export const accountTypeOptions = Object.values(AccountType).map((value) => ({
  value,
  label: value,
}));