export interface Diagnosis {
  type: string;
  code: string;
  diagnosis: string;
  note: string;
}

export interface ServiceCategory {
  serviceCategoryId: string;
}

export interface ProductService {
  productId: string;
  quantity: number;
  price: number;
  flag: string;
}

export interface EncounterFormData {
  patientId: string;
  department: string;
  serviceType: string;
  encounterStartDateTime: string;
  dischargeStatus: string;
  dischargeDate: string;
  diagnoses: Diagnosis[];
  serviceCategories: string[];
  productServices: ProductService[];
  attendingPhysician: string;
  //  supportingDocuments: string ;
}

export interface EncounterResponse {
  id: string;
  patientId: string;
  department: string;
  serviceType: string;
  encounterStartDateTime: string;
  dischargeStatus: string;
  dischargeDate: string;
  diagnoses: Diagnosis[];
  serviceCategories: string[];
  productServices: ProductService[];
  attendingPhysician: string;
  createdAt: string;
  updatedAt: string;
}

// Error type
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}