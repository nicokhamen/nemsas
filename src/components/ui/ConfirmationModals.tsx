import React, { useState } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";

interface RejectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  billCount?: number;
}

const CloseButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="border border-gray-400 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:border-gray-600 disabled:opacity-50"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);

export const RejectConfirmModal: React.FC<RejectConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  billCount = 1,
}) => {
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"confirm" | "reason">("confirm");

  if (!isOpen) return null;

  const handleInitialReject = () => {
    setStep("reason");
  };

  const handleConfirmReject = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  const handleCancel = () => {
    setStep("confirm");
    setReason("");
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-9999">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg">
            {step === "confirm" ? (
              <>
                {/* Close button */}
                <div className="absolute top-4 right-4">
                  <CloseButton onClick={handleCancel} disabled={isLoading} />
                </div>

                {/* Confirmation Step */}
                <div className="bg-white px-6 pt-10 pb-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 border-2 border-red-400">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Oh Wait!
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    You are about to reject {billCount} bill(s), this action is
                    permanent. Do you still wish to continue?
                  </p>
                </div>

                {/* Footer */}
                <div className="bg-white px-6 py-4 border-t flex justify-center gap-3">
                  <Button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="rounded-sm border border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                  >
                    No,cancel
                  </Button>
                  <Button
                    onClick={handleInitialReject}
                    disabled={isLoading}
                    className="rounded-sm bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Reject
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Close button */}
                <div className="absolute top-4 right-4">
                  <CloseButton
                    onClick={() => {
                      setStep("confirm");
                      setReason("");
                    }}
                    disabled={isLoading}
                  />
                </div>

                {/* Reason Step */}
                <div className="bg-white px-6 pt-10 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Reason for Rejection
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please provide a clear reason for rejecting these bills
                  </p>

                  <textarea
                    rows={5}
                    placeholder="Enter your reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none disabled:opacity-50 resize-none text-sm"
                  />

                  {!reason.trim() && (
                    <p className="text-xs text-red-500 mt-2">
                      Reason is required
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setStep("confirm");
                      setReason("");
                    }}
                    disabled={isLoading}
                    className="rounded-sm"
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmReject}
                    disabled={isLoading || !reason.trim()}
                    className="rounded-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {isLoading ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "approved" | "rejected";
  billCount?: number;
  claimId?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  status,
  billCount = 1,
  claimId = "",
}) => {
  if (!isOpen) return null;

  const isApproved = status === "approved";

  const modalContent = (
    <div className="fixed inset-0 z-10000">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg"
          >
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <CloseButton onClick={onClose} />
            </div>

            {/* Content */}
            <div className="bg-white px-6 pt-10 pb-6 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${isApproved ? "bg-green-100 border-2 border-green-400" : "bg-red-100 border-2 border-red-400"}`}
                >
                  {isApproved ? (
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isApproved ? "Congratulations!" : "Bills Rejected"}
              </h3>
              <p className="text-sm text-gray-600">
                {isApproved
                  ? `You have successfully approved ${claimId} bill`
                  : `You have successfully rejected ${billCount} bill(s) for claim ${claimId}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
