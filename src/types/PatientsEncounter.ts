// Base interface for common fields
interface BaseEntity {
  id: string;
  isActive: boolean;
  createdDate: string;
  providerId?: string;
}

// Patient interface
interface Patient extends BaseEntity {
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: "NHIA" | string;
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
  age: number;
}

// Diagnosis interface
interface Diagnosis extends BaseEntity {
  type: string;
  code: string;
  diagnosis: string;
  note: string;
  emergencyBillId?: string;
}

// Product/Service interface
interface ProductService extends BaseEntity {
  name: string;
  description: string;
  type: string;
  code: string;
  productCategory: "Clinical" | string;
  price: number;
  nhisPercentage: number;
  nhisPrice: number;
  isCovered: boolean;
  quantity: number;
  netAmount: number;
  productId?: string;
  emergencyBillId?: string;
  status?: string;
  flag?: string;
}

// Main Emergency Bill interface
interface EmergencyBill extends BaseEntity {
  // emergencyBillId: string;
  patientId: string;
  department: string;
  serviceType: "Observation" | string;
  encounterStartDateTime: string;
  dischargeStatus: "Discharged" | string;
  dischargeDate: string;
  diagnoses: Diagnosis[];
  serviceCategories: string[];
  productServices: ProductService[];
  attendingPhysician: string;
  supportingDocuments: string[];
  encounterId?: string;
  hospitalName?: string;
  emergencyClaimId?: string;
  status: "New" | "Pending" | "Approved" | "Rejected" | string;
  source: "Internal" | "External" | string;
  patient?: Patient; // Optional nested patient object
  totalAmount?: number;
}

// API Response interface
interface EncounterApiResponse {
  data: EmergencyBill[];
  message: string;
  isSuccess: boolean;
}

// For single bill response
interface SingleEmergencyBillApiResponse {
  data: EmergencyBill;
  message: string;
  isSuccess: boolean;
}

// Filter params for fetching bills
interface EmergencyBillFilterParams {
  patientId?: string;
  patientName?: string;
  patientNumber?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  serviceType?: string;
  status?: string;
  providerId?: string;
}

// Create/Update bill payload
interface CreateEmergencyBillPayload {
  patientId: string;
  department: string;
  serviceType: string;
  encounterStartDateTime: string;
  dischargeStatus: string;
  dischargeDate: string;
  diagnoses: Omit<Diagnosis, keyof BaseEntity | "emergencyBillId">[];
  serviceCategories: string[];
  productServices: Omit<
    ProductService,
    keyof BaseEntity | "emergencyBillId" | "productId"
  >[];
  attendingPhysician: string;
  supportingDocuments?: string[];
  providerId?: string;
}

// Statistics interface for dashboard
interface EmergencyBillStatistics {
  totalBills: number;
  pendingBills: number;
  approvedBills: number;
  rejectedBills: number;
  totalAmount: number;
  averagePerBill: number;
}

// Export all interfaces
export type {
  BaseEntity,
  Patient,
  Diagnosis,
  ProductService,
  EmergencyBill,
  EncounterApiResponse,
  SingleEmergencyBillApiResponse,
  EmergencyBillFilterParams,
  CreateEmergencyBillPayload,
  EmergencyBillStatistics,
};
