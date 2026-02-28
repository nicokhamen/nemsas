import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../services/store/store";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import FormHeader from "../../../components/form/FormHeader";
import { useAppDispatch } from "../../../hooks/redux";

// Table imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table";
import { Pagination } from "../../../components/pagination";

// Thunk and actions
import { fetchClaimsEmergencyBills } from "../../../services/thunks/claimEmergencyThunk";
import { clearCurrentEmergencyBills } from "../../../services/slices/claimEmergencyBillsSlice";
import VettingModal from "../../../components/ui/VettingModal";
import { mdVetEmergencyClaim } from "../../../services/thunks/mdRequestThunk";
import type { ClaimEmergencyBill } from "../../../types/ClaimEmergencyBills";

// Status color map for discharge status
const statusColor: Record<string, string> = {
  Approved: "#2e7d32",
  Pending: "#1976d2",
  Rejected: "#d32f2f",
  Default: "#6b6f80",
};

// Insurance status color
const insuranceStatusColor: Record<string, string> = {
  NHIA: "#2196f3",
  Private: "#4caf50",
  SSHIAS: "#9c27b0",
  Default: "#4caf50",
};

// Format currency
const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};



export const MdReviewBills = () => {
  const { id: claimId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get providerId from auth context
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerId = currentUser?.providerId || "";

  // Approve Reject bill state
    const [showVettingModal, setShowVettingModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_vettingAction, setVettingAction] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payload for vetting
  const buildVettingPayload = (
  status: 'Approved' | 'Rejected',
  remark?: string
) => ({
  emergencyClaimId: claimId!,
  emergencyBillIds: selectedBills,
  status,
  remark,
  isBillOnly: true,
  vettedAmount: selectedTotalAmount,
});

  
  // Get emergency bills data from Redux store
  const { 
    data: emergencyBills,
    loading, 
    error,
  } = useSelector((state: RootState) => state.claimsEmergencyBills);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  // Load emergency bills when claimId and providerId are available
  const loadEmergencyBills = useCallback(() => {
    if (claimId && providerId) {
      dispatch(fetchClaimsEmergencyBills({ 
        emergencyClaimId: claimId, 
        providerId 
      }));
    }
  }, [dispatch, claimId, providerId]);

  // Load data on component mount or when IDs change
  useEffect(() => {
    if (claimId && providerId) {
      loadEmergencyBills();
    }
    
    // Clear data when component unmounts
    return () => {
      dispatch(clearCurrentEmergencyBills());
    };
  }, [dispatch, claimId, providerId, loadEmergencyBills]);

  const calculateTotalAmount = (bill: ClaimEmergencyBill): number => {
  if (!bill.productServices || bill.productServices.length === 0) return 0;
  return bill.productServices.reduce((total, service) => total + service.netAmount, 0);
};

  // Map emergency bills to table format
const tableBills = useMemo(() => {
  if (!emergencyBills?.data) return [];
  
  return emergencyBills.data.map((bill, index) => ({
    id: bill.id,
    sn: index + 1,
    patientName: `${bill.patient?.firstName || ''} ${bill.patient?.lastName || ''}`.trim(),
    patientHospitalNumber: bill.patient?.hospitalNumber || 'N/A',
    patientAge: bill.patient?.age || 'N/A',
    patientGender: bill.patient?.gender || 'N/A',
    patientInsuranceStatus: bill.patient?.insuranceStatus || 'N/A',
    hospitalName: bill.hospitalName,
    department: bill.department,
    serviceType: bill.serviceType,
    encounterStart: formatDate(bill.encounterStartDateTime),
    dischargeStatus: bill.dischargeStatus,
    status: bill.status,
    dischargeDate: bill.dischargeDate ? formatDate(bill.dischargeDate) : 'N/A',
    attendingPhysician: bill.attendingPhysician || 'N/A',
    diagnosesCount: bill.diagnoses?.length || 0,
    servicesCount: bill.productServices?.length || 0,
    totalAmount: calculateTotalAmount(bill), // Use calculated amount
    formattedTotalAmount: formatCurrency(calculateTotalAmount(bill)),
    serviceCategories: bill.serviceCategories?.join(', ') || 'N/A',
    createdDate: formatDate(bill.createdDate),
    rawData: bill,
  }));
}, [emergencyBills]);

  // Update selected bills when row selection changes
  useEffect(() => {
    const selectedIds = Object.keys(rowSelection)
      .map((rowIndex) => tableBills[parseInt(rowIndex)]?.id)
      .filter(Boolean);
    setSelectedBills(selectedIds);
  }, [rowSelection, tableBills]);

  // Define columns for the emergency bills table
  const columns: ColumnDef<(typeof tableBills)[0]>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "patientName",
      header: "Patient Name",
      enableSorting: true,
    },
    {
      accessorKey: "patientHospitalNumber",
      header: "Hospital No.",
      enableSorting: true,
    },
    {
      accessorKey: "patientInsuranceStatus",
      header: "Insurance",
      cell: ({ row }) => {
        const status = row.original.patientInsuranceStatus;
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${insuranceStatusColor[status] || insuranceStatusColor.Default}20`,
              color: insuranceStatusColor[status] || insuranceStatusColor.Default,
            }}
          >
            {status}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "hospitalName",
      header: "Hospital",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.original.hospitalName}>
          {row.original.hospitalName}
        </div>
      ),
    },
    {
      accessorKey: "formattedTotalAmount",
      header: "Total Amount",
      enableSorting: true,
    },
    {
      accessorKey: "dischargeStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${statusColor[status] || statusColor.Default}20`,
              color: statusColor[status] || statusColor.Default,
            }}
          >
            {status}
          </span>
        );
      },
      enableSorting: true,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: tableBills,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(table.getState().pagination);
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = table.getPageCount();

  // Calculate total amount of selected bills
  const selectedTotalAmount = useMemo(() => {
    return Object.keys(rowSelection)
      .reduce((sum, rowIndex) => {
        const bill = tableBills[parseInt(rowIndex)];
        return sum + (bill?.totalAmount || 0);
      }, 0);
  }, [rowSelection, tableBills]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/md-review");
  };

  // Handle refresh
  const handleRefresh = () => {
    loadEmergencyBills();
  };

  // Handle row click to view bill details
  const handleRowClick = (billId: string) => {
    navigate(`/emergency/bills/${billId}`);
  };

  // Handle bulk action
  const handleBulkAction = () => {
    if (selectedBills.length > 0) {
      // console.log("Selected bill IDs:", selectedBills);
      // console.log("Total selected amount:", formatCurrency(selectedTotalAmount));
      
      // alert(`Processing ${selectedBills.length} bill(s) with total amount: ${formatCurrency(selectedTotalAmount)}`);
         setShowVettingModal(true);
    setVettingAction(null);
    }
  };
  // Handle approve action
const handleApproveBills = async () => {
  if (!claimId || selectedBills.length === 0) return;

  setIsProcessing(true);

  try {
    const payload = buildVettingPayload( 'Approved',
      'Approved by Medical Director');

    await dispatch(mdVetEmergencyClaim(payload)).unwrap();

    table.resetRowSelection();
    setShowVettingModal(false);

    loadEmergencyBills();
  } catch (err: any) {
    alert(err ?? 'Failed to approve bills');
  } finally {
    setIsProcessing(false);
  }
};

// Handle reject action
const handleRejectBills = async (reason: string) => {
  if (!claimId || selectedBills.length === 0) return;

  setIsProcessing(true);

  try {
    const payload = buildVettingPayload('Rejected', reason);

    await dispatch(mdVetEmergencyClaim(payload)).unwrap();

    table.resetRowSelection();
    setShowVettingModal(false);
    setVettingAction(null);

    loadEmergencyBills();
  } catch (err: any) {
    alert(err ?? 'Failed to reject bills');
  } finally {
    setIsProcessing(false);
  }
};


// Handle modal close
const handleModalClose = () => {
  if (!isProcessing) {
    setShowVettingModal(false);
    setVettingAction(null);
  }
};

  // Show loading while waiting for user data
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

 return (
  <>
    <div className="p-6 h-full">
      <div className="bg-gray-100 h-full overflow-hidden">
        <div className="bg-white rounded-md flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-6 flex-shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  ← Back
                </Button>
                <FormHeader>
                  Emergency Bills for Claim 
                </FormHeader>
              </div>
              <input
                type="text"
                placeholder="Search bills by patient name or hospital"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  table.setColumnFilters([
                    {
                      id: "patientName",
                      value: e.target.value,
                    },
                    {
                      id: "hospitalName",
                      value: e.target.value,
                    },
                  ]);
                }}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              />
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500 flex-shrink-0">
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={handleRefresh} 
                className="mt-2 text-red-600 hover:text-red-700"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Content - with proper scrolling */}
          <div className="flex-1 overflow-hidden">
            {loading && !emergencyBills ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : !providerId ? (
              <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                  Provider ID is required to view emergency bills
                </div>
              </div>
            ) : !claimId ? (
              <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                  Claim ID is missing. Please go back and select a claim.
                </div>
                <Button onClick={handleBack}>Back to Claims</Button>
              </div>
            ) : tableBills.length === 0 ? (
              <EmptyState
                icon={<span className="text-2xl">🏥</span>}
                title="No emergency bills available"
                description={error ? "Failed to load bills" : "No bills found for this claim."}
                action={
                  <Button onClick={handleBack}>
                    ← Back to Claims
                  </Button>
                }
              />
            ) : (
              <div className="h-full flex flex-col overflow-hidden">
                {/* Selected rows info */}
                {selectedBills.length > 0 && (
                  <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-blue-700">
                          {selectedBills.length} bill(s) selected
                        </span>
                        <span className="text-sm text-blue-700">
                          Total amount: {formatCurrency(selectedTotalAmount)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => table.resetRowSelection()}
                        >
                          Clear Selection
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleBulkAction}
                        >
                          Process Selected ({selectedBills.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table container with horizontal scroll */}
                <div className="flex-1 overflow-auto min-h-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[1200px] w-full border-collapse">
                        <TableHeader className="border-y border-gray-200 sticky top-0 bg-white z-10">
                          {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => (
                                <TableHead 
                                  key={header.id}
                                  className="whitespace-nowrap px-4 py-3"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              ))}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                              <TableRow
                                key={row.id}
                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => handleRowClick(row.original.id)}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell 
                                    key={cell.id}
                                    className="whitespace-nowrap px-4 py-3"
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex flex-col items-center gap-4">
                                  <span className="font-medium">
                                    No bills found
                                  </span>
                                  <span className="text-gray-500">
                                    Try adjusting your search criteria
                                  </span>
                                  <Button onClick={handleRefresh}>
                                    Refresh Data
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-end border-t border-gray-200 flex-shrink-0">
                  <Pagination
                    totalEntriesSize={table.getFilteredRowModel().rows.length}
                    currentPage={pageIndex + 1}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={(p) => setPageIndex(p - 1)}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPageIndex(0);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
   
      <VettingModal
        isOpen={showVettingModal}
        onClose={handleModalClose}
        onApprove={handleApproveBills}
        onReject={handleRejectBills}
        title={`Vet ${selectedBills.length} Selected Bill(s)`}
        message={`You are about to process ${selectedBills.length} bill(s) with a total amount of ${formatCurrency(selectedTotalAmount)}. Do you want to approve or reject these bills?`}
        approveText={`Approve (${selectedBills.length})`}
        rejectText={`Reject (${selectedBills.length})`}
        isLoading={isProcessing}
      />
    </div>
  </>
);
};

export default MdReviewBills;