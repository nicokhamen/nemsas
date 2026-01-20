// emergency-bill.types.ts
import { type Patient } from './patient.types';
import { type Diagnosis } from './diagnosis.types';
import { type ProductService } from './product-service.types';

// Enums for better type safety
export type ServiceType =
  | 'Observation'
  | 'Emergency';

export type DischargeStatus =
  | 'Discharged'
  | 'Admitted'
  | 'Transferred'
  | 'Deceased';

  export type ClaimStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | string;


// Main Emergency Bill interface
export interface EmergencyBill {
  id: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  department: string;
  serviceType: ServiceType | string;
  encounterStartDateTime: string;
  dischargeStatus: DischargeStatus | string;
  dischargeDate: string;
  status: ClaimStatus;
  diagnoses: Diagnosis[];
  serviceCategories: string[];
  productServices: ProductService[];
  attendingPhysician: string;
  supportingDocuments: string[];
  isActive: boolean;
  createdDate: string;
  patient: Patient;
}

// For creating new emergency bills (without auto-generated fields)
export interface CreateEmergencyBill {
  patientId: string;
  department: string;
  serviceType: ServiceType | string;
  encounterStartDateTime: string;
  dischargeStatus?: DischargeStatus | string;
  dischargeDate?: string;
  diagnoses: Omit<Diagnosis, 'id' | 'emergencyBillId' | 'isActive' | 'createdDate'>[];
  serviceCategories: string[];
  productServices: Omit<ProductService, 'id' | 'emergencyBillId' | 'isActive' | 'createdDate'>[];
  attendingPhysician: string;
  supportingDocuments?: string[];
  encounterId?: string;
}

// For updating emergency bills
export interface UpdateEmergencyBill {
  id: string;
  department?: string;
  serviceType?: ServiceType | string;
  dischargeStatus?: DischargeStatus | string;
  dischargeDate?: string;
  diagnoses?: Diagnosis[];
  serviceCategories?: string[];
  productServices?: ProductService[];
  attendingPhysician?: string;
  supportingDocuments?: string[];
  isActive?: boolean;
}

// Response interfaces
export interface EmergencyBillResponse {
  data: EmergencyBill;
  message: string;
  isSuccess: boolean;
}

export interface EmergencyBillsResponse {
  data: EmergencyBill[];
  message: string;
  isSuccess: boolean;
}

// State interface for state management (Redux)
export interface EmergencyBillState {
  bills: EmergencyBill[];
  currentBill: EmergencyBill | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  hasFetched: boolean;
}

// Filter interface for querying emergency bills
export interface EmergencyBillFilter {
  patientId?: string;
  department?: string;
  serviceType?: ServiceType | string;
  dischargeStatus?: DischargeStatus | string;
  startDate?: string;
  endDate?: string;
  attendingPhysician?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// Summary interface for dashboard/lists
export interface EmergencyBillSummary {
  id: string;
  patientName: string;
  hospitalNumber: string;
  department: string;
  serviceType: string;
  encounterDate: string;
  dischargeStatus: string;
  totalAmount: number;
  createdDate: string;
  attendingPhysician: string;
}

export interface EmergencyBillSummaryResponse {
  data: EmergencyBillSummary[];
  message: string;
  isSuccess: boolean;
}

// Simplified types for UPDATE requests
export interface UpdateDiagnosisRequest {
  id?: string; // Optional for existing diagnoses
  type: string;
  code: string;
  diagnosis: string;
  note?: string;
}

export interface UpdateProductServiceRequest {
  id?: string; // Optional for existing items
  productId: string;
  quantity: number;
  price: number;
  flag?: string;
  name?: string; // For reference
  description?: string; // For reference
}

export interface UpdateEmergencyBillRequest {
  id: string;
  patientId: string;
  department?: string;
  serviceType?: ServiceType | string;
  encounterStartDateTime?: string;
  dischargeStatus?: DischargeStatus | string;
  dischargeDate?: string;
  diagnoses?: UpdateDiagnosisRequest[];
  serviceCategories?: string[];
  productServices?: UpdateProductServiceRequest[];
  attendingPhysician?: string;
  supportingDocuments?: string[];
  isActive?: boolean;
}