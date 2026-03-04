import React, { useState } from "react";
import MDReviewModal from "./MDReviewModal";
import SignatureCaptureModal from "./SignatureCaptureModal";
import { RejectConfirmModal, SuccessModal } from "./ConfirmationModals";
import type { ClaimEmergencyBill } from "../../types/ClaimEmergencyBills";

interface VettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (signature?: string, mdName?: string) => void;
  onReject: (reason: string) => void;
  isLoading?: boolean;
  bills?: ClaimEmergencyBill[];
  claimId?: string;
  billCount?: number;
  totalAmount?: string;
}

type FlowStep =
  | "review"
  | "approve-signature"
  | "reject-confirm"
  | "success"
  | "error";
type SuccessType = "approved" | "rejected";

const VettingModal: React.FC<VettingModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false,
  bills = [],
  claimId = "",
  billCount = 1,
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("review");
  const [successType, setSuccessType] = useState<SuccessType | null>(null);

  if (!isOpen) return null;

  const handleApproveClick = () => {
    setCurrentStep("approve-signature");
  };

  const handleRejectClick = () => {
    setCurrentStep("reject-confirm");
  };

  const handleSignatureConfirm = (signature: string, mdName: string) => {
    onApprove(signature, mdName);
    setCurrentStep("success");
    setSuccessType("approved");
  };

  const handleRejectConfirm = (reason: string) => {
    onReject(reason);
    setCurrentStep("success");
    setSuccessType("rejected");
  };

  const handleSuccessClose = () => {
    setCurrentStep("review");
    onClose();
  };

  const handleClose = () => {
    if (currentStep === "review") {
      setCurrentStep("review");
      onClose();
    }
  };

  return (
    <>
      {/* Step 1: Review Details Modal */}
      <MDReviewModal
        isOpen={isOpen && currentStep === "review"}
        onClose={handleClose}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        bills={bills}
        claimId={claimId}
        isLoading={isLoading}
      />

      {/* Step 2: Signature Modal */}
      <SignatureCaptureModal
        isOpen={isOpen && currentStep === "approve-signature"}
        onClose={() => setCurrentStep("review")}
        onConfirm={handleSignatureConfirm}
        onReject={() => setCurrentStep("reject-confirm")}
        isLoading={isLoading}
      />

      {/* Step 3: Rejection Confirmation Modal */}
      <RejectConfirmModal
        isOpen={isOpen && currentStep === "reject-confirm"}
        onClose={() => setCurrentStep("review")}
        onConfirm={handleRejectConfirm}
        isLoading={isLoading}
        billCount={billCount}
      />

      {/* Step 4: Success Modal */}
      {successType && (
        <SuccessModal
          isOpen={isOpen && currentStep === "success"}
          onClose={handleSuccessClose}
          status={successType}
          billCount={billCount}
          claimId={claimId}
        />
      )}
    </>
  );
};

export default VettingModal;
