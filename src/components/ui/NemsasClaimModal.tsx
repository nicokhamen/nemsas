// import React, { useEffect, useState } from "react";
// import Modal from "./Modal";
// import Button from "./Button";
// import Select from "./Select";
// import { getEnrollees } from "../../services/api/enrolleeApi";
// import { createClaims } from "../../services/api/claimsApi";
// import { useProviderContext } from "../../context/useProviderContext";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../services/store/store";
// import SuccessModal from "../form/SuccessModal";

// interface ServiceItem {
//   name: string;
//   approvalCode: string;
//   amount: string;
// }

// interface SingleClaimModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmitted?: () => void;
// }

// // UI Display Options (what users see)
// const uiServiceOptions = [
//   { label: "Admission", value: "Inpatient care" },
//   { label: "Observation", value: "Outpatient care" },
// ];

// // Backend Expected Values
// const backendServiceValues = {
//   "Inpatient care": "InpatientCare",
//   "Outpatient care": "OutpatientCare",
// };

// const NemsasClaimModal: React.FC<SingleClaimModalProps> = ({
//   open,
//   onClose,
//   onSubmitted,
// }) => {
//   // Enrollee selection
//   const [enrolleeName, setEnrolleeName] = useState("");
//   const [enrolleeId, setEnrolleeId] = useState("");
//   const [selectedEnrolleeNumber, setSelectedEnrolleeNumber] = useState("");
//   const [enrolleeOptions, setEnrolleeOptions] = useState<
//     { value: string; label: string; name: string; enrolleeIdNumber: string }[]
//   >([]);
//   const [enrolleeLoading, setEnrolleeLoading] = useState(false);
//   const [enrolleeError, setEnrolleeError] = useState("");
//   const userHmoId = useSelector((s: RootState) => s.auth.user?.hmoId);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [date, setDate] = useState("");
//   const [serviceType, setServiceType] = useState("");
//   const [items, setItems] = useState<ServiceItem[]>([
//     { name: "", approvalCode: "", amount: "" },
//   ]);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState("");
//   const { selectedProviderId } = useProviderContext();
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   const handleAddItem = () => {
//     setItems([...items, { name: "", approvalCode: "", amount: "" }]);
//   };

//   const handleItemChange = (
//     idx: number,
//     field: keyof ServiceItem,
//     value: string
//   ) => {
//     const newItems = [...items];
//     newItems[idx][field] = value;
//     setItems(newItems);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!enrolleeId || !selectedProviderId || !userHmoId) return;
    
//     setSubmitting(true);
//     setSubmitError("");
    
//     try {
//       const nowIso = new Date().toISOString();
//       const claimName = items[0]?.name || `${enrolleeName || "Claim"} - ${date}`;

//       // Convert UI service type to backend format
//       const backendClaimType = backendServiceValues[serviceType as keyof typeof backendServiceValues] || "InpatientCare";

//       // Create the payload according to CreateClaimsPayload interface
//       const claimData = {
//         claimName,
//         providerId: selectedProviderId,
//         hmoId: userHmoId,
//         claimDate: nowIso,
//         claimItems: items.map((it) => ({
//           serviceRendered: it.name,
//           enrolleeName: enrolleeName,
//           patientEnrolleeNumber: selectedEnrolleeNumber,
//           providerId: selectedProviderId,
//           hmoId: userHmoId,
//           enrolleeEmail: "",
//           enrolleePhoneNumber: phoneNumber,
//           claimType: backendClaimType, // Use converted backend value
//           quantity: 1,
//           price: Number(it.amount) || 0,
//           discount: 0,
//           amount: Number(it.amount) || 0,
//           diagnosis: "",
//           approvalCode: it.approvalCode,
//           referralHospital: "",
//           nhisno: "",
//           serviceDate: date ? new Date(date).toISOString() : nowIso,
//           attachments: [] as string[],
//         })),
//       };

//       await createClaims(claimData);

//       setShowSuccessModal(true);
//       if (onSubmitted) onSubmitted();
      
//       setTimeout(() => {
//         setShowSuccessModal(false);
//         onClose();
//       }, 3000);
//     } catch (error) {
//       console.error("Claim submission error:", error);
//       setSubmitError("Failed to submit claim. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const removeItem = (idx: number) => {
//     const newItems = items.filter((_, index) => index !== idx);
//     setItems(newItems);
//   };

//   const isFormValid = () => {
//     // Check required fields
//     if (!enrolleeId || !selectedProviderId || !userHmoId || !phoneNumber || !date || !serviceType) {
//       return false;
//     }

//     // Check if at least one service item is filled
//     const hasValidItems = items.some(item => 
//       item.name.trim() !== "" && 
//       item.amount.trim() !== "" && 
//       !isNaN(Number(item.amount)) && 
//       Number(item.amount) > 0
//     );

//     return hasValidItems;
//   };

//   // Load enrollees on open
//   useEffect(() => {
//     if (!open || !userHmoId) return;
//     setEnrolleeLoading(true);
//     setEnrolleeError("");
    
//     interface EnrolleeBrief {
//       id: string;
//       firstName: string;
//       lastName: string;
//       enrolleeIdNumber: string;
//     }
    
//     getEnrollees({ HMOId: userHmoId, PageNumber: 1, PageSize: 100 })
//       .then((res) => {
//         const list = ((res.data || []) as EnrolleeBrief[]).map((en) => ({
//           value: en.id,
//           label: `${en.firstName} ${en.lastName}`.trim() || en.enrolleeIdNumber,
//           name: `${en.firstName} ${en.lastName}`.trim(),
//           enrolleeIdNumber: en.enrolleeIdNumber,
//         }));
//         setEnrolleeOptions(list);
//       })
//       .catch(() => setEnrolleeError("Failed to load enrollees"))
//       .finally(() => setEnrolleeLoading(false));
//   }, [open, userHmoId]);

//   useEffect(() => {
//     if (!open) {
//       setEnrolleeId("");
//       setEnrolleeName("");
//       setSelectedEnrolleeNumber("");
//       setPhoneNumber("");
//       setDate("");
//       setServiceType("");
//       setItems([{ name: "", approvalCode: "", amount: "" }]);
//       setSubmitError("");
//       setShowSuccessModal(false);
//     }
//   }, [open]);

//   return (
//     <>
//       <Modal
//         open={open}
//         onClose={onClose}
//         title="Emergency Claim"
//         width="600px"
//       >
//         <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2">
//         <form
//           onSubmit={handleSubmit}
//           style={{ display: "flex", flexDirection: "column", gap: 16 }}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//             <label className="text-sm font-medium text-gray-700">
//               Patient Name
//             </label>
//             <Select
//               value={enrolleeId}
//               placeholder={
//                 enrolleeLoading ? "Loading enrollees..." : "Select Patient"
//               }
//               options={enrolleeOptions}
//               onChange={(val) => {
//                 setEnrolleeId(val);
//                 const found = enrolleeOptions.find((o) => o.value === val);
//                 setEnrolleeName(found?.name || "");
//                 setSelectedEnrolleeNumber(found?.enrolleeIdNumber || "");
//               }}
//               className="text-sm"
//             />
//             {enrolleeError && (
//               <span className="text-xs text-red-600">{enrolleeError}</span>
//             )}
//           </div>
//           <div style={{ display: "flex", gap: 16 }}>
//             <input
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               placeholder="Phone number"
//               required
//               style={{
//                 flex: 1,
//                 padding: 8,
//                 borderRadius: 4,
//                 border: "1px solid #ccc",
//               }}
//             />
//             <input
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               type="date"
//               required
//               style={{
//                 flex: 1,
//                 padding: 8,
//                 borderRadius: 4,
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
//           <div className="flex items-center gap-5">
//             <p>Encounter Type</p>
//             <select
//               value={serviceType}
//               onChange={(e) => setServiceType(e.target.value)}
//               required
//               style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
//             >
//               <option value="">Select</option>
//               {uiServiceOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div className="text-sm font-medium text-gray-700">Service Items</div>
          
//           {/* Custom Table Implementation for Better Alignment */}
//           <div className="border border-gray-200 rounded-lg overflow-hidden">
//             {/* Table Header */}
//             <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200">
//               <div className="col-span-1 px-4 py-3 text-xs font-medium text-gray-500 text-center">
//                 S/N
//               </div>
//               <div className="col-span-6 px-4 py-3 text-xs font-medium text-gray-500">
//                 Service name
//               </div>
//               <div className="col-span-3 px-4 py-3 text-xs font-medium text-gray-500">
//                 Amount
//               </div>
//               <div className="col-span-2 px-4 py-3 text-xs font-medium text-gray-500 text-center">
//                 Action
//               </div>
//             </div>
            
//             {/* Table Body */}
//             <div className="bg-white">
//               {items.map((item, idx) => (
//                 <div key={idx} className="grid grid-cols-12 border-b border-gray-100 last:border-b-0">
//                   {/* S/N */}
//                   <div className="col-span-1 px-4 py-3 text-sm text-gray-600 text-center">
//                     {idx + 1}
//                   </div>
                  
//                   {/* Service Name */}
//                   <div className="col-span-6 px-4 py-2">
//                     <input
//                       value={item.name}
//                       onChange={(e) => handleItemChange(idx, "name", e.target.value)}
//                       placeholder="Service name"
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
                  
//                   {/* Amount */}
//                   <div className="col-span-3 px-4 py-2">
//                     <input
//                       value={item.amount}
//                       onChange={(e) => handleItemChange(idx, "amount", e.target.value)}
//                       placeholder="Amount"
//                       type="number"
//                       required
//                       min="0"
//                       step="0.01"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
                  
//                   {/* Action */}
//                   <div className="col-span-2 px-4 py-3 text-center">
//                     {items.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeItem(idx)}
//                         className="text-red-600 text-xs hover:text-red-800 font-medium"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           <Button
//             type="button"
//             onClick={handleAddItem}
//             className="bg-transparent text-[#DC2626] hover:bg-[#DC2626]/10 flex self-start mb-12"
//           >
//             <div className="flex items-center gap-4 text-[#DC2626]">
//               <div className="w-8 h-8 rounded-lg bg-[#DC2626]/20 text-xl font-extrabold">
//                 +
//               </div>
//               <p>Add item</p>
//             </div>
//           </Button>
          
//           <div className="flex flex-col gap-2 self-start">
//             <Button
//               type="submit"
//               disabled={!isFormValid() || submitting}
//               className="flex self-start px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {submitting ? "Submitting..." : "Submit Claim"}
//             </Button>
            
//             {/* Validation messages */}
//             {!isFormValid() && (
//               <div className="text-xs text-gray-500 max-w-xs">
//                 {!enrolleeId && <div>• Select an enrollee</div>}
//                 {!phoneNumber && <div>• Enter phone number</div>}
//                 {!date && <div>• Select date</div>}
//                 {!serviceType && <div>• Select encounter type</div>}
//                 {enrolleeId && phoneNumber && date && serviceType && 
//                  !items.some(item => item.name.trim() && item.amount.trim() && Number(item.amount) > 0) && (
//                   <div>• Add at least one service item with name and amount</div>
//                 )}
//                 {!selectedProviderId && (
//                   <div>• Select a provider in the header</div>
//                 )}
//               </div>
//             )}
            
//             {submitError && (
//               <span className="text-xs text-red-600">{submitError}</span>
//             )}
//           </div>
//         </form>
//         </div>
//       </Modal>

//       <SuccessModal
//         isOpen={showSuccessModal}
//         onClose={() => {
//           setShowSuccessModal(false);
//           onClose();
//         }}
//         title="Claim Created Successfully!"
//         message="Your claim has been submitted and is now being processed."
//       />
//     </>
//   );
// };

// export default NemsasClaimModal;