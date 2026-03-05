import React, { useState } from "react";
import MDReviewModal from "./MDReviewModal";
import SignatureCaptureModal from "./SignatureCaptureModal";
import { RejectConfirmModal, SuccessModal } from "./ConfirmationModals";
import type { ClaimEmergencyBill } from "../../types/ClaimEmergencyBills";

interface VettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (signature?: string, mdName?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
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

  // track name/signature so we can hand them to the success screen when approval succeeds
  const [approvedMdName, setApprovedMdName] = useState<string>("");
  const [approvedSignature, setApprovedSignature] = useState<string>("");

  if (!isOpen) return null;

  const handleApproveClick = () => {
    setCurrentStep("approve-signature");
  };

  const handleRejectClick = () => {
    setCurrentStep("reject-confirm");
  };

  const handleSignatureConfirm = async (signature: string, mdName: string) => {
    try {
      // remember values for PDF
      setApprovedMdName(mdName);
      setApprovedSignature(signature);

      await onApprove(signature, mdName);
      setCurrentStep("success");
      setSuccessType("approved");
    } catch {
      // stays on signature step; error shown by parent
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    try {
      await onReject(reason);
      setCurrentStep("success");
      setSuccessType("rejected");
    } catch {
      // stays on reject-confirm step; error shown by parent
    }
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
        mdName={approvedMdName}
        signatureDataUrl={approvedSignature}
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
          mdName={approvedMdName}
          signatureDataUrl={approvedSignature}
          bills={bills}
        />
      )}
    </>
  );
};

export default VettingModal;
