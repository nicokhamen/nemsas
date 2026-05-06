import React, { useState, useEffect } from "react";
import Button from "./Button";
import { AlertCircle } from "lucide-react";

interface DisputeVettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  maxLength?: number;
}

const DisputeVettingModal: React.FC<DisputeVettingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Dispute Bill",
  confirmText = "Submit Dispute",
  cancelText = "Cancel",
  isLoading = false,
  maxLength = 200,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const normalizedTitle = title.toLowerCase();
  const actionContext = normalizedTitle.includes("resolve")
    ? "resolution"
    : normalizedTitle.includes("reject")
      ? "rejection"
      : normalizedTitle.includes("dispute")
        ? "dispute"
        : "action";

  //  Auto-clear when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError(`Please enter a reason for this ${actionContext}.`);
      return;
    }

    setError("");
    onSubmit(reason);
  };

  const handleChange = (value: string) => {
    setReason(value);

    // Clear error as user types
    if (error && value.trim()) {
      setError("");
    }
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

        {/* Textarea */}
        <div className="mb-2">
          <label className="block text-sm text-gray-600 mb-2">
            {`Reason for ${actionContext}`}
          </label>

          <textarea
            value={reason}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            maxLength={maxLength}
            placeholder="Enter your reason here..."
            className={`w-full p-2 border rounded resize-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "focus:ring-red-500 focus:border-red-500"
            }`}
          />

          {/* ✅ Character Counter */}
          <div className="flex justify-between mt-1 text-xs">
            <span className="text-red-500">{error}</span>
            <span className="text-gray-400">
              {reason.length} / {maxLength}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Submitting..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default DisputeVettingModal;
