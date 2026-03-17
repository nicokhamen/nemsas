import React from "react";
import { X } from "lucide-react";

type ProviderDetailsModalProps = {
  provider: {
    id: string;
    hospitalName: string;
    code: string;
    email: string;
    hospitalAdress: string;
    phoneNumber: string;
    stateLicenseNumber: string;
    geoLocation: string;
    isActive: boolean;
  };
  onClose: () => void;
};

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  provider,
  onClose,
}) => {
  // Hardcoded status flag - you can change this logic as needed
  const getStatusFlag = () => {
    // You can implement your own logic here
    // For example, based on provider.isActive or any other condition
    return provider.isActive ? "Active" : "Inactive";
  };

  const statusFlag = getStatusFlag();

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[750px] rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Provider Details
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Provider Title */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-800">
                {provider.hospitalName}
              </h3>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  statusFlag === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {statusFlag}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {provider.code || "N/A"}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="border border-red-500 text-red-500 px-5 py-2 rounded-md hover:bg-red-50">
              Suspend
            </button>

            <button className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700">
              Activate
            </button>
          </div>
        </div>

        {/* Provider Information */}
        <div className="px-6 py-4">
          <h4 className="text-red-500 font-semibold mb-4">
            Provider Information
          </h4>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-400">Hospital Name</p>
              <p className="font-medium text-gray-700">
                {provider.hospitalName}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Location</p>
              <p className="font-medium text-gray-700">
                {provider.geoLocation || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Phone number</p>
              <p className="font-medium text-gray-700">
                {provider.phoneNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Status</p>
              <p className="font-medium text-gray-700">{statusFlag}</p>
            </div>

            <div>
              <p className="text-gray-400">License Number</p>
              <p className="font-medium text-gray-700">
                {provider.stateLicenseNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-700">
                {provider.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Provider ID</p>
              <p className="font-medium text-gray-700">
                {provider.code || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Address</p>
              <p className="font-medium text-gray-700">
                {provider.hospitalAdress || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsModal;
