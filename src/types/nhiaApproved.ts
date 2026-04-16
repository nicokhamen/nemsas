export interface NhiaApproved {
  data: NhiaApprovedItem[];
  message: string;
  isSuccess: boolean;
}

export interface NhiaApprovedItem {
  name: string;
  code: string;
  state: string;
  address: string;
}