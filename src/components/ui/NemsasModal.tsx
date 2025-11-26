import React, { useEffect, useState } from "react";
import { CLAIM_STATUSES } from '../../constant/claimStatuses';
import Modal from "./Modal";
import Button from "./Button";
import { useProviderContext } from "../../context/useProviderContext"; // retained for other potential uses, not for providerId source
import { useSelector } from 'react-redux';
import type { RootState } from '../../services/store/store';
import SuccessModal from "../form/SuccessModal";
// local storage caching removed for server-first submission
import { createNemsasClaim } from "../../services/api/nemsasApi";
import { useCustomToast } from "../../hooks/useCustomToast";
import { fetchNemsasClaims } from "../../services/thunks/nemsasThunk";
import { useAppDispatch } from "../../hooks/redux";

export interface ServiceItem {
  name: string;
  amount: string; // numeric string
  claimStatus: string; // Pending | Processed | Rejected | Resolved | Approved | Paid
  quantity: string; // numeric string for easy binding
}

interface SingleClaimModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

// Constants
const NEMSAS_ID = "2e4c6fa4-6ac3-43bb-b78f-326dccac110c"; // constant as specified

const NemsasClaimModal: React.FC<SingleClaimModalProps> = ({
  open,
  onClose,
  onSubmitted,
}) => {
  // Patient information - input directly by user
  const [claimName, setClaimName] = useState("");
  const [claimDate, setClaimDate] = useState(""); // separate claim date
  const [serviceDate, setServiceDate] = useState(""); // separate service date
  const [patientName, setPatientName] = useState("");
  const [patientNumber, setPatientNumber] = useState(""); // maps to patientNumber in API request body
  const [phoneNumber, setPhoneNumber] = useState("");
  // Constrained service types (dropdown)
  const SERVICE_TYPE_OPTIONS = ["Observation", "Admission"] as const;
  const [serviceType, setServiceType] = useState(""); // must choose one
  const STATUS_OPTIONS = CLAIM_STATUSES;
  const DEFAULT_STATUS = "Pending";
  const [items, setItems] = useState<ServiceItem[]>([
    { name: "", amount: "", claimStatus: DEFAULT_STATUS, quantity: "1" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { selectedProviderId } = useProviderContext();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", amount: "", claimStatus: DEFAULT_STATUS, quantity: "1" },
    ]);
  };

  const handleItemChange = (idx: number, field: keyof ServiceItem, value: string) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const dispatch = useAppDispatch();

  const { success: toastSuccess, error: toastError } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const providerIdToUse = authUser?.providerId; // requirement: use logged-in user's providerId
    if (!providerIdToUse) {
      setSubmitError('Missing providerId on logged in user – please re-login.');
      return;
    }
    
    setSubmitting(true);
    setSubmitError("");
    
    try {
      const payload = {
        nemsasId: NEMSAS_ID,
  providerId: providerIdToUse,
        claimName,
        claimDate: claimDate ? new Date(claimDate).toISOString() : new Date().toISOString(),
        patientName,
        patientNumber,
        phoneNumber,
        serviceDate: serviceDate ? new Date(serviceDate).toISOString() : new Date().toISOString(),
        serviceType,
        claimItems: items.map((it) => ({
          id: crypto.randomUUID(),
          name: it.name,
          amount: Number(it.amount) || 0,
          claimStatus: it.claimStatus || DEFAULT_STATUS,
          claimType: "EmergencyService",
          quantity: Number(it.quantity) || 1,
        })),
      };

  // (Optional) If local draft caching is needed, reintroduce saveClaimToLocalStorage with mapped shape.

      // API call
      const response = await createNemsasClaim(payload);

      if (response?.isSuccess) {
        toastSuccess(response.message || "NEMSAS Claim created successfully");
        // Refresh list (non-blocking)
        // Refresh list (now including NEMSASId to avoid empty first fetch)
        dispatch(
          fetchNemsasClaims({
            ProviderId: providerIdToUse,
            NEMSASId: NEMSAS_ID,
            PageNumber: 1,
            PageSize: 500,
            SortBy: "createdDate",
          })
        );
        if (onSubmitted) onSubmitted();
        // Close immediately after toast cue
        onClose();
        resetForm();
      } else {
        toastError(response?.message || "Failed to create NEMSAS Claim");
      }
    } catch (error) {
  console.error("Claim submission error:", error);
  toastError("Claim submission failed. Please try again.");
  setSubmitError("Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, index) => index !== idx);
    setItems(newItems);
  };

  const resetForm = () => {
    setClaimName("");
    setClaimDate("");
    setServiceDate("");
    setPatientName("");
    setPatientNumber("");
    setPhoneNumber("");
    setServiceType("");
  setItems([{ name: "", amount: "", claimStatus: DEFAULT_STATUS, quantity: "1" }]);
    setSubmitError("");
  };

  const isFormValid = () => {
    // Check required fields
    if (!selectedProviderId || !claimName || !claimDate || !serviceDate || !patientName || !patientNumber || !phoneNumber || !serviceType) {
      return false;
    }

    // Check if at least one service item is filled
    const hasValidItems = items.some(item => 
      item.name.trim() !== "" && 
      item.amount.trim() !== "" && 
      !isNaN(Number(item.amount)) && 
      Number(item.amount) > 0
    );

    return hasValidItems;
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      setShowSuccessModal(false);
    }
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Emergency Claim"
        width="600px"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2">
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Claim Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="text-sm font-medium text-gray-700">Claim Name</label>
            <input
              value={claimName}
              onChange={(e) => setClaimName(e.target.value)}
              placeholder="Enter claim name"
              required
              style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>

          {/* Patient Name Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <input 
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient full name"
              required
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Patient / Enrollee Number */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="text-sm font-medium text-gray-700">
              Patient Number
            </label>
            <input
              value={patientNumber}
              onChange={(e) => setPatientNumber(e.target.value)}
              placeholder="Enter patient number"
              required
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                required
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-gray-700">Service Date</label>
              <input value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} type="date" required style={{ flex:1, padding:8, borderRadius:4, border:"1px solid #ccc"}} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-gray-700">Claim Date</label>
              <input value={claimDate} onChange={(e) => setClaimDate(e.target.value)} type="date" required style={{ flex:1, padding:8, borderRadius:4, border:"1px solid #ccc"}} />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-gray-700">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
                style={{ flex:1, padding:8, borderRadius:4, border:"1px solid #ccc", background:'#fff' }}
              >
                <option value="" disabled>Select service type</option>
                {SERVICE_TYPE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-sm font-medium text-gray-700">Claim Items</div>
          
          {/* Custom Table Implementation for Better Alignment */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-14 bg-gray-50 border-b border-gray-200">
              <div className="col-span-1 px-2 py-3 text-[10px] font-medium text-gray-500 text-center">#</div>
              <div className="col-span-4 px-2 py-3 text-[10px] font-medium text-gray-500">Name</div>
              <div className="col-span-3 px-2 py-3 text-[10px] font-medium text-gray-500">Amount</div>
              {/* <div className="col-span-3 px-2 py-3 text-[10px] font-medium text-gray-500">Status</div> */}
              <div className="col-span-2 px-2 py-3 text-[10px] font-medium text-gray-500">Qty</div>
              <div className="col-span-1 px-2 py-3 text-[10px] font-medium text-gray-500 text-center">X</div>
            </div>
            
            {/* Table Body */}
            <div className="bg-white">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-14 border-b border-gray-100 last:border-b-0">
                  <div className="col-span-1 px-2 py-2 text-xs text-gray-600 text-center">{idx + 1}</div>
                  <div className="col-span-4 px-2 py-2">
                    <input value={item.name} onChange={(e) => handleItemChange(idx, "name", e.target.value)} placeholder="Name" required className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                  </div>
                  <div className="col-span-3 px-2 py-2">
                    <input value={item.amount} onChange={(e) => handleItemChange(idx, "amount", e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" required className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                  </div>
                  {/* <div className="col-span-3 px-2 py-2">
                    <select
                      value={item.claimStatus}
                      onChange={(e) => handleItemChange(idx, "claimStatus", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-[11px] bg-white"
                    >
                      {STATUS_OPTIONS.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div> */}
                  <div className="col-span-2 px-2 py-2">
                    <input value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", e.target.value)} type="number" min="1" step="1" className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                  </div>
                  <div className="col-span-1 px-2 py-2 text-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 text-[10px] hover:text-red-800 font-medium">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleAddItem}
            className="bg-transparent text-[#DC2626] hover:bg-[#DC2626]/10 flex self-start mb-12"
          >
            <div className="flex items-center gap-4 text-[#DC2626]">
              <div className="w-8 h-8 rounded-lg bg-[#DC2626]/20 text-xl font-extrabold">
                +
              </div>
              <p>Add item</p>
            </div>
          </Button>
          
          <div className="flex flex-col gap-2 self-start">
            <Button
              type="submit"
              disabled={!isFormValid() || submitting}
              className="flex self-start px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Claim"}
            </Button>
            
            {/* Validation messages */}
            {!isFormValid() && (
              <>
              <div className="text-xs text-gray-500 max-w-xs">
                {!claimName && <div>• Enter claim name</div>}
                {!claimDate && <div>• Select claim date</div>}
                {!serviceDate && <div>• Select service date</div>}
                {!patientName && <div>• Enter patient name</div>}
                {!patientNumber && <div>• Enter patient / enrollee number</div>}
                {!phoneNumber && <div>• Enter phone number</div>}
                {!serviceType && <div>• Select service type</div>}
                {claimName && claimDate && serviceDate && patientName && patientNumber && phoneNumber && serviceType &&
                  !items.some(item => item.name.trim() && item.amount.trim() && Number(item.amount) > 0) && (
                    <div>• Add at least one claim item with name and amount</div>
                )}
                {!authUser?.providerId && (
                  <div>• Logged in user has no providerId</div>
                )}
                
              </div>
              </>
            )}
            
            {submitError && (
              <span className="text-xs text-red-600">{submitError}</span>
            )}
          </div>
        </form>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="Claim Created Successfully!"
        message="Your claim has been submitted and is now being processed."
      />
    </>
  );
};

export default NemsasClaimModal;