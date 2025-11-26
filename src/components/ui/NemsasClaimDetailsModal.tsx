import React, { useEffect, useState, useCallback } from "react";
import Modal from "./Modal";
import Button from "./Button";
import {
  fetchNemsasClaimById,
  updateNemsasClaim,
} from "../../services/api/nemsasApi";
import type {
  NemsasClaimItemRequest,
  UpdateNemsasClaimRequest,
} from "../../services/api/nemsasApi";
import { CLAIM_STATUSES } from "../../constant/claimStatuses";
import { useCustomToast } from "../../hooks/useCustomToast";
import { useProviderContext } from "../../context/useProviderContext";
import { fetchNemsasClaims } from "../../services/thunks/nemsasThunk";
import { useAppDispatch } from "../../hooks/redux";
import { Trash2, XCircle } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

// Status code mapping constants moved outside component for stable identity
const statusCodeToText: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Paid",
  5: "Resolved", // guessed additional code if backend adds
  6: "Processed", // guessed
};
const textToStatusCode: Record<string, number> = Object.fromEntries(
  Object.entries(statusCodeToText).map(([k, v]) => [v, Number(k)])
);

interface NemsasClaimDetailsModalProps {
  open: boolean;
  onClose: () => void;
  claimId: string | null;
}

// Extend to allow backward compatibility reading legacy 'status'
interface EditableClaimItem extends NemsasClaimItemRequest {
  status?: string; // legacy field
  originalStatusCode?: number; // preserve numeric code if response was numeric
}

interface EditableClaim {
  id: string;
  nemsasId: string;
  providerId: string;
  claimName: string;
  claimDate: string;
  patientName: string;
  patientNumber: string;
  phoneNumber: string;
  serviceDate: string;
  serviceType: string;
  claimItems: EditableClaimItem[];
}

const NemsasClaimDetailsModal: React.FC<NemsasClaimDetailsModalProps> = ({
  open,
  onClose,
  claimId,
}) => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [claim, setClaim] = useState<EditableClaim | null>(null);
  const [originalClaim, setOriginalClaim] = useState<EditableClaim | null>(
    null
  );
  const [editing, setEditing] = useState<boolean>(false);
  const { selectedProviderId } = useProviderContext();
  const { success: toastSuccess, error: toastError } = useCustomToast();
  const dispatch = useAppDispatch();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ... existing functions

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log("deleted successfully")
    if (!claimId) return;
    
    setDeleting(true);
    try {
      // Add your delete API call here
      // Example: await deleteNemsasClaim(claimId);
      
      toastSuccess("Claim deleted successfully");
      // Refresh main list
      // dispatch(
      //   fetchNemsasClaims({
      //     ProviderId: selectedProviderId,
      //     PageNumber: 1,
      //     PageSize: 500,
      //     SortBy: "createdDate",
      //   })
      // );
      setDeleteModalOpen(false);
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Delete failed";
      toastError(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  // mappings now referenced from top-level constants

  interface RawClaimItem {
    id: string;
    name: string;
    amount: number;
    claimStatus?: string | number;
    status?: string | number; // legacy
    claimType: string;
    quantity: number;
  }

  const normalizeItem = useCallback((raw: RawClaimItem): EditableClaimItem => {
    const value = raw.claimStatus ?? raw.status;
    if (typeof value === "number") {
      return {
        id: raw.id,
        name: raw.name,
        amount: raw.amount,
        claimStatus: statusCodeToText[value] || "Pending",
        originalStatusCode: value,
        claimType: raw.claimType,
        quantity: raw.quantity,
      };
    }
    return {
      id: raw.id,
      name: raw.name,
      amount: raw.amount,
      claimStatus: (value as string) || "Pending",
      claimType: raw.claimType,
      quantity: raw.quantity,
    };
  }, []);

  const loadClaim = useCallback(async () => {
    if (!claimId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchNemsasClaimById(claimId);
      if (res?.isSuccess && res?.data) {
        const data = res.data;
        const mappedItems = Array.isArray(data.claimItems)
          ? data.claimItems.map(normalizeItem)
          : [];
        const mappedClaim: EditableClaim = {
          id: data.id,
          nemsasId: data.nemsasId,
          providerId: data.providerId,
          claimName: data.claimName,
          claimDate: data.claimDate,
          patientName: data.patientName,
          patientNumber: data.patientNumber,
          phoneNumber: data.phoneNumber,
          serviceDate: data.serviceDate,
          serviceType: data.serviceType,
          claimItems: mappedItems,
        };
        setClaim(mappedClaim);
        setOriginalClaim(mappedClaim); // snapshot for cancel
        setEditing(false);
      } else {
        setError(res?.message || "Failed to load claim");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load claim";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [claimId, normalizeItem]);

  useEffect(() => {
    if (open) {
      loadClaim();
    } else {
      setClaim(null);
      setError("");
      setOriginalClaim(null);
      setEditing(false);
    }
  }, [open, loadClaim]);

  const handleItemChange = (
    idx: number,
    field: keyof EditableClaimItem,
    value: string | number
  ) => {
    if (!claim) return;
    const updated = { ...claim };
    updated.claimItems = [...updated.claimItems];
    // Narrow mutation without using any
    const current = updated.claimItems[idx];
    const mutated: EditableClaimItem = {
      ...current,
      [field]:
        field === "amount" || field === "quantity" ? Number(value) : value,
    } as EditableClaimItem;
    updated.claimItems[idx] = mutated;
    setClaim(updated);
  };

  const addItem = () => {
    if (!claim) return;
    const updated = { ...claim };
    updated.claimItems = [
      ...updated.claimItems,
      {
        id: crypto.randomUUID(),
        name: "",
        amount: 0,
        claimStatus: "Pending",
        claimType: "EmergencyService",
        quantity: 1,
      },
    ];
    setClaim(updated);
  };

  const removeItem = (idx: number) => {
    if (!claim) return;
    const updated = { ...claim };
    updated.claimItems = updated.claimItems.filter((_, i) => i !== idx);
    setClaim(updated);
  };

  const isValid = () => {
    if (!claim) return false;
    const required = [
      claim.claimName,
      claim.patientName,
      claim.patientNumber,
      claim.phoneNumber,
      claim.serviceType,
    ];
    if (required.some((v) => !v || !v.toString().trim())) return false;
    if (!claim.claimItems.length) return false;
    if (claim.claimItems.some((ci) => !ci.name.trim() || ci.amount <= 0))
      return false;
    return true;
  };

  const handleUpdate = async () => {
    if (!claim || !claimId || !selectedProviderId) return;
    if (!isValid()) {
      toastError("Fill all required fields");
      return;
    }
    setUpdating(true);
    try {
      const payload: UpdateNemsasClaimRequest = {
        nemsasId: claim.nemsasId,
        providerId: selectedProviderId,
        claimName: claim.claimName,
        claimDate: claim.claimDate,
        patientName: claim.patientName,
        patientNumber: claim.patientNumber,
        phoneNumber: claim.phoneNumber,
        serviceDate: claim.serviceDate,
        serviceType: claim.serviceType,
        claimItems: claim.claimItems.map((ci) => ({
          id: ci.id,
          name: ci.name,
          amount: ci.amount,
          claimStatus:
            ci.originalStatusCode !== undefined
              ? textToStatusCode[String(ci.claimStatus)] ??
                ci.originalStatusCode
              : ci.claimStatus || "Pending",
          claimType: ci.claimType,
          quantity: ci.quantity,
        })),
        id: claim.id,
      };
      const res = await updateNemsasClaim(claimId, payload);
      if (res?.isSuccess) {
        toastSuccess(res.message || "Claim updated");
        // Refresh main list
        dispatch(
          fetchNemsasClaims({
            ProviderId: selectedProviderId,
            PageNumber: 1,
            PageSize: 500,
            SortBy: "createdDate",
          })
        );
        onClose();
      } else {
        toastError(res?.message || "Update failed");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Update failed";
      toastError(message);
    } finally {
      setUpdating(false);
    }
  };

  return (
   <>
  <Modal open={open} onClose={onClose} title="Claim Details" width="760px"  style={{ zIndex: 50 }} >
    {loading && <div style={{ padding: 16 }}>Loading claim...</div>}
    {error && !loading && <div style={{ padding: 16, color: 'red' }}>{error}</div>}
    {!loading && !error && claim && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {!editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* ------------------Action Buttons ----------------- */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', // Center the buttons
              gap: 12, 
              paddingBottom: 12, 
              borderBottom: '1px solid #e3e3e3' 
            }}>
              <Button onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
           
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
              {[
                ['Claim Name', claim.claimName],
                ['Service Type', claim.serviceType],
                ['Patient Name', claim.patientName],
                ['Patient Number', claim.patientNumber],
                ['Phone Number', claim.phoneNumber],
                ['Service Date', claim.serviceDate.split('T')[0]],
                ['Claim Date', claim.claimDate.split('T')[0]],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>{label}</span>
                  <span style={{ padding: '6px 8px', background: '#fafafa', border: '1px solid #e3e3e3', borderRadius: 4 }}>{value}</span>
                </div>
              ))}
            </div>
           
            <div style={{ fontWeight: 600, fontSize: 14 }}>Claim Items</div>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 70px', background: '#f7f9fa', fontSize: 11, fontWeight: 600 }}>
                <div style={{ padding: '8px 4px', textAlign: 'center' }}>#</div>
                <div style={{ padding: '8px 4px' }}>Name</div>
                <div style={{ padding: '8px 4px' }}>Amount</div>
                <div style={{ padding: '8px 4px' }}>Status</div>
                <div style={{ padding: '8px 4px' }}>Qty</div>
              </div>
              {claim.claimItems.map((ci, idx) => (
                <div key={ci.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 70px', borderTop: '1px solid #eee', fontSize: 11 }}>
                  <div style={{ padding: '6px 4px', textAlign: 'center' }}>{idx + 1}</div>
                  <div style={{ padding: '6px 4px' }}>{ci.name || '-'}</div>
                  <div style={{ padding: '6px 4px' }}>{ci.amount}</div>
                  <div style={{ padding: '6px 4px' }}>{ci.claimStatus || 'Pending'}</div>
                  <div style={{ padding: '6px 4px' }}>{ci.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ 
  display: 'flex', 
  justifyContent: 'center', 
  gap: 12, 
  paddingBottom: 12, 
  borderBottom: '1px solid #e3e3e3' 
}}>
  <Button onClick={handleUpdate} disabled={!isValid() || updating}>
    {updating ? 'Updating...' : 'ReSubmit'}
  </Button>
  
  <div title="Cancel">
    <Button 
      variant="outline" 
      onClick={() => { if (originalClaim) setClaim(originalClaim); setEditing(false); }}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <XCircle size={16} />
    </Button>
  </div>
  
  <div title="Delete">
    <Button 
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#dc2626', color: 'white' }} onClick={handleDeleteClick}
    >
      <Trash2 size={16} />
    </Button>
  </div>
</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Claim Name</label>
                <input value={claim.claimName} onChange={e => setClaim({ ...claim, claimName: e.target.value })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Service Type</label>
                <select
                  value={claim.serviceType}
                  onChange={e => setClaim({ ...claim, serviceType: e.target.value })}
                  style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4, background:'#fff' }}
                >
                  <option value="Observation">Observation</option>
                  <option value="Admission">Admission</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Patient Name</label>
                <input value={claim.patientName} onChange={e => setClaim({ ...claim, patientName: e.target.value })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Patient Number</label>
                <input value={claim.patientNumber} onChange={e => setClaim({ ...claim, patientNumber: e.target.value })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Phone Number</label>
                <input value={claim.phoneNumber} onChange={e => setClaim({ ...claim, phoneNumber: e.target.value })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Service Date</label>
                <input type="date" value={claim.serviceDate.split('T')[0]} onChange={e => setClaim({ ...claim, serviceDate: new Date(e.target.value).toISOString() })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12 }}>Claim Date</label>
                <input type="date" value={claim.claimDate.split('T')[0]} onChange={e => setClaim({ ...claim, claimDate: new Date(e.target.value).toISOString() })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Claim Items</div>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 110px 90px 50px', background: '#f7f9fa', fontSize: 11, fontWeight: 600 }}>
                <div style={{ padding: '8px 4px', textAlign: 'center' }}>#</div>
                <div style={{ padding: '8px 4px' }}>Name</div>
                <div style={{ padding: '8px 4px' }}>Amount</div>
                <div style={{ padding: '8px 4px' }}>Status</div>
                <div style={{ padding: '8px 4px' }}>Qty</div>
                <div style={{ padding: '8px 4px', textAlign: 'center' }}>X</div>
              </div>
              {claim.claimItems.map((ci, idx) => (
                <div key={ci.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 110px 90px 50px', borderTop: '1px solid #eee', fontSize: 11 }}>
                  <div style={{ padding: '6px 4px', textAlign: 'center' }}>{idx + 1}</div>
                  <div style={{ padding: '6px 4px' }}>
                    <input value={ci.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} style={{ width: '100%', padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
                  </div>
                  <div style={{ padding: '6px 4px' }}>
                    <input type="number" min={0} value={ci.amount} onChange={e => handleItemChange(idx, 'amount', e.target.value)} style={{ width: '100%', padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
                  </div>
                  <div style={{ padding: '6px 4px' }}>
                    <select
                      value={ci.claimStatus || ci.status || 'Pending'}
                      onChange={e => handleItemChange(idx, 'claimStatus', e.target.value)}
                      style={{ width: '100%', padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
                    >
                      {CLAIM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ padding: '6px 4px' }}>
                    <input type="number" min={1} value={ci.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={{ width: '100%', padding: 4, border: '1px solid #ccc', borderRadius: 4 }} />
                  </div>
                  <div style={{ padding: '6px 4px', textAlign: 'center' }}>
                    {claim.claimItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} style={{ background: 'transparent', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 600 }}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addItem} style={{ alignSelf: 'flex-start' }}>+ Add Item</Button>
          </div>
        )}
      </div>
    )}
  </Modal>
    {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Claim"
        message="Are you sure you want to delete this claim? This action cannot be undone."
        confirmText="Delete Claim"
        cancelText="Cancel"
        type="delete"
        isLoading={deleting}
      />
</>
  );
};

export default NemsasClaimDetailsModal;
