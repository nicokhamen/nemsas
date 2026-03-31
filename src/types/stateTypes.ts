// TO GET all the states
export interface StateData {
  id: string;
  isActive: boolean;
  countryCode: string;
  name: string;
  code: string;
  createdDate: string; 
}

// Full API response
export interface StateResponse {
  data: StateData[];
  message: string;
  isSuccess: boolean;
}
