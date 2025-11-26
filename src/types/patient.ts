export interface PatientRegistrationData {
  providerId: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: 'NHIA' | string; 
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
}

export interface PatientRegistrationResponse {
  id: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
}

export interface PatientRegistrationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  patientData: PatientRegistrationResponse | null;
}