export const ServiceType = {
  Admission: "Admission",
  Observation: "Observation",
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

// Dropdown options
export const serviceTypeOptions = Object.values(ServiceType).map(value => ({
  value,
  label: value,
}));

// discharge type
export const DischargeType = {
  Transferred: "Transferred",
  Discharged: "Discharged",
} as const;

export type DischargeType = (typeof DischargeType)[keyof typeof DischargeType];

// Dropdown options
export const dischargeTypeOptions = Object.values(DischargeType).map(value => ({
  value,
  label: value,
}));