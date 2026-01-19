import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface VettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  title?: string;
  message?: string;
  approveText?: string;
  rejectText?: string;
  isLoading?: boolean;
}

const VettingModal: React.FC<VettingModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title = 'Vet Claim',
  message = 'Do you want to approve or reject this claim?',
  approveText = 'Approve',
  rejectText = 'Reject',
  isLoading = false,
}) => {
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen) return null;

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(rejectReason.trim());
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Header */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0 3h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>

                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{message}</p>

                  {/* Reject reason */}
                  {mode === 'reject' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for rejection <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                        placeholder="Provide a clear reason for rejecting this claim..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              {/* Approve */}
              <button
                type="button"
                onClick={() => {
                  setMode('approve');
                  onApprove();
                }}
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 sm:w-auto disabled:opacity-50"
              >
                {approveText}
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => {
                  if (mode !== 'reject') {
                    setMode('reject');
                    return;
                  }
                  handleReject();
                }}
                disabled={isLoading || (mode === 'reject' && !rejectReason.trim())}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:w-auto disabled:opacity-50"
              >
                {rejectText}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default VettingModal;
