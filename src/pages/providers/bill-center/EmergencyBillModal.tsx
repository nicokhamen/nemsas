// components/EmergencyBillModal.tsx
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { updateEmergencyBill } from "../../../services/thunks/emergencyBillsThunk";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { X, Pencil, Save, XCircle } from "lucide-react";
import { useCustomToast } from "../../../hooks/useCustomToast";

interface ProductService {
  id?: string;
  name: string;
  description: string;
  nhisPrice: number;
  nhisPercentage: number;
  quantity: number;
  price: number;
}

interface EmergencyBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: any;
  providerId: string;
  onSuccess?: () => void;
}

export const EmergencyBillModal: React.FC<EmergencyBillModalProps> = ({
  isOpen,
  onClose,
  billData,
  providerId,
  // onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const toast = useCustomToast()

  useEffect(() => {
    if (billData) {
      setFormData(JSON.parse(JSON.stringify(billData)));
    }
  }, [billData]);

  if (!isOpen || !formData) return null;

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "₦0.00";
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateTotal = () => {
    if (!formData?.productServices) return 0;
    return formData.productServices.reduce(
      (sum: number, item: ProductService) =>
        sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
  };

  const handleProductServiceChange = (
    index: number,
    field: keyof ProductService,
    value: any,
  ) => {
    const updatedServices = [...formData.productServices];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    setFormData({ ...formData, productServices: updatedServices });
  };

  const addProductService = () => {
    const newService: ProductService = {
      name: "",
      description: "",
      nhisPrice: 0,
      nhisPercentage: 0,
      quantity: 1,
      price: 0,
    };
    setFormData({
      ...formData,
      productServices: [...(formData.productServices || []), newService],
    });
  };

  const removeProductService = (index: number) => {
    const updatedServices = formData.productServices.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData({ ...formData, productServices: updatedServices });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      const updatedData = {
        ...formData,
        totalAmount,
        providerId,
      };

      await dispatch(
        updateEmergencyBill({
          emergencyBillId: formData.id,
          updateData: updatedData,
        }),
      ).unwrap();

      setIsEditing(false);
      toast.success("Bill has been updated successfully")
      onClose();
    } catch (error) {
      console.error("Failed to update bill:", error);
    } finally {
      setLoading(false);
    }
  };

  const patient = formData.patient || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay - lower z-index */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
          onClick={onClose}
        />

        {/* Modal content - higher z-index */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full z-50 relative">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Products & Services" : "Bill Details"}
              </h3>
              {/* <p className="text-sm text-gray-500 mt-1">
                Bill ID: {formData.id}
              </p> */}
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit 
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto">
            {/* Bill Status - Read Only */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Status:</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    formData.status === "Rejected"
                      ? "bg-red-100 text-red-600"
                      : formData.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : formData.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {formData.status || "Unknown"}
                </span>
              </div>
            </div>

            {/* Patient Header - Read Only */}
            <div className="px-6 py-5 flex items-center gap-4 border-b">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden" />
              <div>
                <p className="font-semibold">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {patient.hospitalNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Patient Details - Read Only */}
            <Section title="Patient Details">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <ReadOnlyItem
                  label="Patient Number"
                  value={patient.hospitalNumber || "N/A"}
                />
                <ReadOnlyItem
                  label="Gender"
                  value={patient.gender || "N/A"}
                />
                <ReadOnlyItem
                  label="Phone number"
                  value={patient.phoneNumber || "N/A"}
                />
                <ReadOnlyItem
                  label="Insurance"
                  value={patient.insuranceStatus || "N/A"}
                />
                <ReadOnlyItem
                  label="Ward Name"
                  value={formData.department || "N/A"}
                />
                <ReadOnlyItem
                  label="Email"
                  value={patient.email || "N/A"}
                />
              </div>
            </Section>

            {/* Encounter Details - Read Only */}
            <Section title="Encounter Details & Diagnosis">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <ReadOnlyItem
                  label="Encounter ID"
                  value={formData.encounterId || "N/A"}
                />
                <ReadOnlyItem
                  label="Service Type"
                  value={formData.serviceType || "N/A"}
                />
                <ReadOnlyItem
                  label="Attending Physician"
                  value={formData.attendingPhysician || "N/A"}
                />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </Section>

            {/* Products & Services - ONLY EDITABLE SECTION */}
            <Section title="Products & Services">
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-7 bg-green-50 text-xs font-medium text-gray-600 px-4 py-3">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1 text-right">Qty</div>
                  <div className="col-span-1 text-right">Unit Price</div>
                  <div className="col-span-1 text-right">Total</div>
                  {isEditing && <div className="col-span-0"></div>}
                </div>

                {formData.productServices?.map(
                  (service: ProductService, index: number) => {
                    const itemTotal =
                      (service.price || 0) * (service.quantity || 1);
                    return (
                      <div
                        key={service.id || index}
                        className="grid grid-cols-7 px-4 py-3 border-t text-sm hover:bg-gray-50 items-center"
                      >
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) =>
                                handleProductServiceChange(
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="col-span-2 border rounded px-2 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={service.description}
                              onChange={(e) =>
                                handleProductServiceChange(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="col-span-2 border rounded px-2 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Description"
                            />
                            <input
                              type="number"
                              value={service.quantity}
                              onChange={(e) =>
                                handleProductServiceChange(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="col-span-1 border rounded px-2 py-1 mr-2 text-right focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              min="1"
                            />
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) =>
                                handleProductServiceChange(
                                  index,
                                  "price",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="col-span-1 border rounded px-2 py-1 mr-2 text-right focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                            />
                            <div className="col-span-1 text-right font-medium text-green-600">
                              {formatCurrency(itemTotal)}
                            </div>
                            <button
                              onClick={() => removeProductService(index)}
                              className="ml-2 text-red-500 hover:text-red-700 transition"
                              type="button"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="col-span-2 font-medium">
                              {service.name || "N/A"}
                            </div>
                            <div className="col-span-2 text-gray-600">
                              {service.description || "—"}
                            </div>
                            <div className="col-span-1 text-right">
                              {service.quantity || 0}
                            </div>
                            <div className="col-span-1 text-right">
                              {formatCurrency(service.price)}
                            </div>
                            <div className="col-span-1 text-right font-medium text-green-600">
                              {formatCurrency(itemTotal)}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  },
                )}

                {isEditing && (
                  <button
                    onClick={addProductService}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
                    type="button"
                  >
                    + Add Product/Service
                  </button>
                )}

                <div className="grid grid-cols-7 px-4 py-3 border-t bg-gray-50 font-medium text-sm">
                  <div className="col-span-5"></div>
                  <div className="col-span-1 text-right">Total:</div>
                  <div className="col-span-1 text-right text-green-600 font-bold">
                    {formatCurrency(calculateTotal())}
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="px-6 py-4 border-t">
    <h3 className="text-sm font-semibold text-red-500 mb-4">{title}</h3>
    {children}
  </div>
);

// Read-only item component for all non-editable fields
const ReadOnlyItem = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={`flex justify-between items-center ${className}`}>
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);