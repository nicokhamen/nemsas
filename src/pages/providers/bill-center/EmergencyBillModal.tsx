// components/EmergencyBillModal.tsx
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { X, Pencil, Save, XCircle, Plus, Trash2 } from "lucide-react";
import { useCustomToast } from "../../../hooks/useCustomToast";
import { ProductServiceSearch } from "../../../components/ui/ProductServiceSearch";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import type { ProductItem } from "../../../types/productType";
import { deleteEmergencyBill } from "../../../services/thunks/emergencyBillsThunk";
import {
  deleteEmergencyBillService,
  updateEmergencyBillService,
} from "../../../services/thunks/updateEmergencyBillThunk";

interface ProductService {
  id?: string;
  productId?: string;
  name: string;
  description: string;
  nhisPrice: number;
  nhisPercentage: number;
  quantity: number;
  price: number;
  code?: string;
  productCategory?: string;
  isCovered?: boolean;
}

interface EmergencyBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: any;
  onSuccess?: () => void;
}

export const EmergencyBillModal: React.FC<EmergencyBillModalProps> = ({
  isOpen,
  onClose,
  billData,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isDeleteBillModalOpen, setIsDeleteBillModalOpen] = useState(false);
  const [billDeleteLoading, setBillDeleteLoading] = useState(false);
  const toast = useCustomToast();

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

  const handleQuantityChange = (index: number, value: number) => {
    const updatedServices = [...formData.productServices];
    updatedServices[index] = { ...updatedServices[index], quantity: value };
    setFormData({ ...formData, productServices: updatedServices });
  };

  const handleCancelEdit = () => {
    if (billData) {
      setFormData(JSON.parse(JSON.stringify(billData)));
    }
    setEditingItemId(null);
  };

  const handleOpenDeleteBillModal = () => {
    setIsDeleteBillModalOpen(true);
  };

  const handleCloseDeleteBillModal = () => {
    setIsDeleteBillModalOpen(false);
  };

  const handleConfirmDeleteBill = async () => {
    if (!formData?.id) {
      toast.error("Missing emergency bill ID");
      return;
    }

    setBillDeleteLoading(true);
    try {
      const result = await dispatch(deleteEmergencyBill(formData.id)).unwrap();
      toast.success(result.message || "Emergency bill deleted successfully");
      setIsDeleteBillModalOpen(false);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to delete emergency bill:", error);
      toast.error(error || "Failed to delete emergency bill");
    } finally {
      setBillDeleteLoading(false);
    }
  };

  const handleDeleteItem = async (index: number, serviceId?: string) => {
    // If it's an existing service (has ID), call the API
    if (serviceId) {
      setDeleteLoading(serviceId);
      try {
        const result = await dispatch(
          deleteEmergencyBillService(serviceId),
        ).unwrap();

        // Remove the service from local state
        const updatedServices = formData.productServices.filter(
          (_: any, i: number) => i !== index,
        );
        setFormData({ ...formData, productServices: updatedServices });

        toast.success("Service deleted successfully");

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        console.error("Failed to delete service:", error);
        toast.error(error.message || "Failed to delete service");
      } finally {
        setDeleteLoading(null);
      }
    } else {
      // For newly added services (no ID yet), just remove from local state
      const updatedServices = formData.productServices.filter(
        (_: any, i: number) => i !== index,
      );
      setFormData({ ...formData, productServices: updatedServices });
      toast.success("Item removed");
    }
  };

  const handleAddProduct = (product: ProductItem) => {
    const newProduct: ProductService = {
      id: undefined,
      productId: product.id,
      name: product.name,
      description: product.description,
      nhisPrice: (product.price * product.nhisPercentage) / 100,
      nhisPercentage: product.nhisPercentage,
      quantity: 1,
      price: product.price,
      code: product.code,
      productCategory: product.productCategory,
      isCovered: product.isCovered,
    };

    setFormData({
      ...formData,
      productServices: [...(formData.productServices || []), newProduct],
    });
    setShowProductSearch(false);
    toast.success(`${product.name} added successfully`);
  };

  // Update the handleSave function in your EmergencyBillModal component
const handleSave = async () => {
  if (!editingItemId) return;

  setLoading(true);
  try {
    const service = formData.productServices.find(
      (s: ProductService) => s.id === editingItemId
    );

    if (!service) {
      throw new Error("Service not found");
    }

    if (!service.id || !service.productId) {
      throw new Error("Only existing items can be updated");
    }

    const payload = {
      id: service.id,
      productId: service.productId,
      quantity: service.quantity,
    };

    const result = await dispatch(
      updateEmergencyBillService(payload)
    ).unwrap();

    toast.success("Item updated successfully");
    setEditingItemId(null);

    if (onSuccess) onSuccess();
    onClose();
  } catch (error: any) {
    console.error("Failed to update:", error);
    toast.error(error.message || "Failed to update item");
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
                Bill Details
              </h3>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="px-6 py-4 border-b flex items-center justify-between">
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
              <button
                type="button"
                onClick={handleOpenDeleteBillModal}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Bill
              </button>
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
                <ReadOnlyItem label="Gender" value={patient.gender || "N/A"} />
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
                <ReadOnlyItem label="Email" value={patient.email || "N/A"} />
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

            {/* Products & Services - ONLY QUANTITY IS EDITABLE */}
            <Section
              title="Products & Services"
              action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProductSearch(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Products/Services
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Product Search Modal/Dropdown */}
                {showProductSearch && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                      <div
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={() => setShowProductSearch(false)}
                      />
                      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Add Product/Service
                          </h3>
                          <button
                            onClick={() => setShowProductSearch(false)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <ProductServiceSearch
                          onSelect={handleAddProduct}
                          selectedItems={formData.productServices || []}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-8 bg-green-50 text-xs font-medium text-gray-600 px-4 py-3">
                    <div className="col-span-2">Name</div>
                    <div className="col-span-2">Description</div>
                    <div className="col-span-1 text-right">Qty</div>
                    <div className="col-span-1 text-right">Unit Price</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {formData.productServices?.map(
                    (service: ProductService, index: number) => {
                      const itemTotal =
                        (service.price || 0) * (service.quantity || 1);
                      const isDeleting = deleteLoading === service.id;
                      const rowEditingKey = service.id || `row-${index}`;
                      const isEditingRow = editingItemId === rowEditingKey;

                      return (
                        <div
                          key={service.id || index}
                          className="grid grid-cols-8 px-4 py-3 border-t text-sm hover:bg-gray-50 items-center"
                        >
                          {/* Name - Always Read Only */}
                          <div className="col-span-2 font-medium">
                            {service.name || "N/A"}
                          </div>

                          {/* Description - Always Read Only */}
                          <div className="col-span-2 text-gray-600">
                            {service.description || "—"}
                          </div>

                          {/* Quantity - Editable only when isEditing is true */}
                          <div className="col-span-1 text-right">
                            {isEditingRow ? (
                              <input
                                type="number"
                                value={service.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    index,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-20 border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                min="0"
                              />
                            ) : (
                              <span>{service.quantity || 0}</span>
                            )}
                          </div>

                          {/* Unit Price - Always Read Only */}
                          <div className="col-span-1 text-right">
                            {formatCurrency(service.price)}
                          </div>

                          {/* Total - Always Read Only */}
                          <div className="col-span-1 text-right font-medium text-green-600">
                            {formatCurrency(itemTotal)}
                          </div>

                          {/* Action Buttons - Delete and Plus */}
                          <div className="col-span-1 flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleDeleteItem(index, service.id)
                              }
                              disabled={isDeleting}
                              className="p-1 text-red-500 hover:text-red-700 transition rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                              aria-label="Delete item"
                            >
                              {isDeleting ? (
                                <LoadingSpinner size="small" color="text-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                            <button
                           onClick={() => setEditingItemId(service.id!)}
                              // onClick={() => setEditingItemId(rowEditingKey)}
                              className="p-1 text-green-500 hover:text-green-700 transition rounded hover:bg-green-50"
                              type="button"
                              aria-label="Edit item"
                              // disabled={loading || !!deleteLoading}
                              disabled={!service.id || loading || !!deleteLoading}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}

                  {editingItemId && (
                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition"
                        type="button"
                        disabled={loading}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        type="button"
                      >
                        {loading ? (
                          <LoadingSpinner size="small" color="text-white" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-8 px-4 py-3 border-t bg-gray-50 font-medium text-sm">
                    <div className="col-span-6"></div>
                    <div className="col-span-1 text-right">Total:</div>
                    <div className="col-span-1 text-right text-green-600 font-bold">
                      {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteBillModalOpen}
        onClose={handleCloseDeleteBillModal}
        onConfirm={handleConfirmDeleteBill}
        title="Delete Emergency Bill"
        message="Are you sure you want to delete this bill?"
        confirmText="Delete Bill"
        cancelText="Cancel"
        type="delete"
        isLoading={billDeleteLoading}
      />
    </div>
  );
};

const Section = ({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="px-6 py-4 border-t">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-red-500">{title}</h3>
      {action}
    </div>
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
