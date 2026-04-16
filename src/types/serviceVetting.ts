export type ServiceVettingStatus =
  | "New"
  | "Vetted"
  | "Disputed"
  | "Pending"
  | "Rejected"
  | "Submitted"
  | "Resubmitted"
  | "Approved"
  | "Declined"
  | "Reviewed"
  | "Paid";

export type ServiceVetting = {
  emergencyBillId: string;
  remark: string;
  status: ServiceVettingStatus;
  productId: string;
};
