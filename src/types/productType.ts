export interface ProductItem {
  id: string;
  name: string;
  description: string;
  type: string;
  code: string;
  productCategory: 'Clinical' | 'Non-Clinical' | 'Laboratory' | 'Imaging' | 'Surgical' | 'Medication';
  price: number;
  nhisPercentage: number;
  nhisPrice: number;
  isCovered: boolean;
  providerId: string;
  isActive: boolean;
  createdDate: string;
}

export interface ProductsResponse {
  data: ProductItem[];
  message: string;
  isSuccess: boolean;
}

export interface ProductSearchParams {
  searchTerm?: string;
  category?: string;
  isCovered?: boolean;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductState {
  data: ProductItem[];
  message: string;
  isSuccess: boolean;
  loading: boolean;
  error: string | null;
  searchParams: ProductSearchParams;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}