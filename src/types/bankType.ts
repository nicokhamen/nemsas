export type BankType = {
  id: number;
  code: string;
  name: string;
};

// export type BankDataResponse = {
//   data: {
//     status: string;
//     message: string;
//     data: BankType[];
//   };
//   message: string;
//   isSuccess: boolean;
// };

export type BankDataResponse = {
  data: BankType[];
  message: string;
  isSuccess: boolean;
};