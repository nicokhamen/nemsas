// patient.types.ts

export type InsuranceStatus = 'NHIA' | 'Private' | 'Self-Pay' | string;

export interface Patient {
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

export interface PatientResponse {
  data: Patient;
  message: string;
  isSuccess: boolean;
}

export interface PatientsResponse {
  data: Patient[];
  message: string;
  isSuccess: boolean;
}

export interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  hasFetched: boolean;
}