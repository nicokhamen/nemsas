// to be deleted

// import type { Step } from "../pages/enrollee/registration/Individual";

// import type { UseFormTrigger } from "react-hook-form";
// import type { EnrolleeFormData } from "../types/Enrollee1";

// export const useStepValidator = () => {
//   const validateEnrolleeStep = async (
//     trigger: UseFormTrigger<EnrolleeFormData>,
//     setStep: React.Dispatch<React.SetStateAction<Step>>
//   ) => {
//     const isValid = await trigger([
//       "firstName",
//       "lastName",
//       "gender",
//       "occupation",
//       "maritalStatus",
//       "emailAddress",
//       "dateOfBirth",
//       "phoneNumber",
//       "fullAddress",
//       "nationality",
//       "stateOfResidence",
//       "enrolleeTypeId",
//       "planTypeId",
//       "nextOfKin.fullName",
//       "nextOfKin.relationship",
//       "nextOfKin.phoneNumber",
//       "nextOfKin.homeAddress",
//     ] as const);

//     if (isValid) {
//       setStep("plan");
//     } else {
//       console.log("Validation failed: Please fill all required fields");
//     }
//   };

//   return { validateEnrolleeStep };
// };
