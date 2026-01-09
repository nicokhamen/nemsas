export type ServiceType = 'Observation' | 'Emergency' | string;
export type DischargeStatus =
  | 'Discharged'
  | 'Admitted'
  | 'Transferred'
  | 'Deceased'
  | string;

export type ProductCategory = 'Clinical' | 'Non-Clinical' | string;
export type InsuranceStatus = 'NHIA' | 'Private' | 'Self-Pay' | string;

export interface ClaimDiagnosis {
  id: string;
  emergencyBillId: string;
  type: string;
  code: string;
  diagnosis: string;
  note: string;
  isActive: boolean;
  createdDate: string;
}

export interface ClaimProductService {
  id: string;
  emergencyBillId: string;
  productId: string;
  providerId: string;
  name: string;
  description: string;
  type: string;
  code: string;
  productCategory: ProductCategory;
  price: number;
  nhisPercentage: number;
  nhisPrice: number;
  isCovered: boolean;
  quantity: number;
  netAmount: number;
  flag: string;
  isActive: boolean;
  createdDate: string;
}

export interface ClaimPatient {
  id: string;
  providerId: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: InsuranceStatus;
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdDate: string;
  age: number;
}

export interface ClaimEmergencyBill {
  id: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  hospitalName: string;
  emergencyClaimId: string;
  department: string;
  serviceType: ServiceType;
  encounterStartDateTime: string;
  dischargeStatus: DischargeStatus;
  dischargeDate: string;
  diagnoses: ClaimDiagnosis[];
  serviceCategories: string[];
  productServices: ClaimProductService[];
  attendingPhysician: string;
  supportingDocuments: string[];
  isActive: boolean;
  createdDate: string;
  patient: ClaimPatient;
}

export interface ClaimEmergencyBills {
  data: ClaimEmergencyBill[];
  message: string;
  isSuccess: boolean;
}
