import React from "react";
import Button from "./Button";
import { AlertCircle } from "lucide-react";

interface RejectVettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const RejectVettingModal: React.FC<RejectVettingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Reject Bill",
  message = "Are you sure you want to reject this bill? This action cannot be undone.",
  confirmText = "Reject",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default RejectVettingModal;