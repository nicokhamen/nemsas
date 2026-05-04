
export interface EmergencyBillServiceRequest {
  productId: string;
  quantity: number;
  id: string;
}

export interface EmergencyBillServiceResponse {
  data: boolean;
  message: string;
  isSuccess: boolean;
}