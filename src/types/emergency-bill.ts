// department.types.ts

export interface Department {
  id: string;
  providerId: string;
  name: string;
  description: string;
  departmentType: string; 
  createdDate: string;
  isActive: boolean;
}

export interface DepartmentsResponse {
  data: Department[]; 
  message: string;
  isSuccess: boolean;
}


export interface DepartmentResponse {
  data: Department; 
  message: string;
  isSuccess: boolean;
}

export interface DepartmentState {
  departments: Department[]; 
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
    hasFetched: boolean; 
}

// service-category.ts

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
}

export interface ServiceCategoryResponse {
  data: ServiceCategory[];
  message: string;
  isSuccess: boolean;
}

export interface ServiceCategoryState {
  categories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  hasFetched: boolean;
}

// icd types
export interface ICDItem {
  code: string;
  name: string;
}

export interface ICDResponse {
  data: ICDItem[];
  message: string;
  isSuccess: boolean;
}

export interface ICDState {
  data: ICDItem[];
  message: string;
  isSuccess: boolean;
  loading: boolean;
  error: string | null;
}
