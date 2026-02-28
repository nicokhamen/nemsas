export interface EmergencyBillPatient {
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  insuranceStatus: string; 
  dateOfBirth: string; 
  gender: string;
  address: string;
  email: string;
  phoneNumber: string;
  id: string; 
  providerId: string; 
  isActive: boolean;
  createdDate: string; 
  age: number;
  totalAmount: number;
  numberOfEncounters: number;
}

export interface EmergencyBillPatients {
  data: EmergencyBillPatient[];
  message: string;
  isSuccess: boolean;
}