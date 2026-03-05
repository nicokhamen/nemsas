import React, { useState } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";

interface SignatureCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signature: string, name: string) => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const SignatureCaptureModal: React.FC<SignatureCaptureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  isLoading = false,
}) => {
  const [mdName, setMdName] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const clearSignature = () => {
    setUploadedSignature("");
    setFileError("");
  };

  const handleConfirm = () => {
    if (!uploadedSignature || !mdName.trim()) return;
    onConfirm(uploadedSignature, mdName.trim());
  };

  const modalContent = (
    <div className="fixed inset-0 z-9999">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-2xl">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Signature
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
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
            </div>

            {/* Subtitle */}
            <div className="px-6 py-3 border-b">
              <p className="text-sm font-semibold text-red-600">
                MD Endorsement
              </p>
            </div>

            {/* Content */}
            <div className="bg-white px-6 py-6">
              <p className="text-sm font-bold text-gray-900 mb-6">
                To approve, add your signature in the box below and your legal
                name
              </p>

              <div className="flex gap-6 items-start mb-4">
                {/* Signature upload area */}
                <div className="flex-1">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-gray-200 rounded-sm bg-gray-50 overflow-hidden flex items-center justify-center h-40 cursor-pointer"
                  >
                    {uploadedSignature ? (
                      <img
                        src={uploadedSignature}
                        alt="uploaded signature"
                        className="max-h-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Attach signature
                      </span>
                    )}
                  </div>
                  {fileError && (
                    <p className="text-xs text-red-500 mt-1">{fileError}</p>
                  )}
                  {uploadedSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      disabled={isLoading}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Name input + upload control */}
                <div className="flex-1 flex flex-col h-full pt-14">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                    className="hidden"
                    onChange={(e) => {
                      setFileError("");
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 200 * 1024) {
                          setFileError("Signature must be less than 200KB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const result = ev.target?.result;
                          if (typeof result === "string") {
                            setUploadedSignature(result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Type your name here"
                    value={mdName}
                    onChange={(e) => setMdName(e.target.value)}
                    disabled={isLoading}
                    className="w-full border-b border-gray-300 pb-2 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-gray-600 disabled:opacity-50 bg-transparent"
                  />
                </div>
              </div>

              {/* Approve + Reject buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading || !uploadedSignature || !mdName.trim()}
                  color="green"
                  size="sm"
                  className="rounded-sm"
                >
                  {isLoading ? "Approving..." : "Approve"}
                </Button>
                {onReject && (
                  <Button
                    onClick={onReject}
                    disabled={isLoading}
                    color="red"
                    variant="outline"
                    size="sm"
                    className="rounded-sm"
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default SignatureCaptureModal;
