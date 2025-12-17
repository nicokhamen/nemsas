// product-service.types.ts

export type ProductCategory = 'Clinical' | 'Non-Clinical' | string;

export interface ProductService {
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

export interface ProductServiceResponse {
  data: ProductService;
  message: string;
  isSuccess: boolean;
}

export interface ProductServicesResponse {
  data: ProductService[];
  message: string;
  isSuccess: boolean;
}

export interface ProductServiceState {
  services: ProductService[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  hasFetched: boolean;
}