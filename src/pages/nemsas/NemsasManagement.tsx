import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import EmptyState from "../../components/ui/EmptyState";
import NemsasClaimDetailsModal from "../../components/ui/NemsasClaimDetailsModal";
import NemsasModal from "../../components/ui/NemsasModal";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import BatchUploadModal from "../../components/ui/BatchUploadModal";
import FormHeader from "../../components/form/FormHeader";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { exportNemsasClaimsReport as exportNemsasClaimsReportApi } from "../../services/api/nemsasApi";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import {
  fetchNemsasClaims,
  fetchNemsasClaimsByPatient,
} from "../../services/thunks/nemsasThunk";
import { clearError } from "../../services/slices/nemsasSlice";
import { useProviderContext } from "../../context/useProviderContext";

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
} from "../../components/table";
import { Pagination } from "../../components/pagination";
import { useNavigate } from "react-router-dom";


// Helper: backend now returns textual claimStatus; keep numeric fallback for legacy responses
const legacyStatusCodeMap: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Paid",
  4: "Disputed",
};

const getClaimStatusText = (status: number | string | undefined): string => {
  if (status === undefined || status === null) return "Pending";
  if (typeof status === "number")
    return legacyStatusCodeMap[status] || "Pending";
  return status.trim() || "Pending";
};

// Status color map
const statusColor: Record<string, string> = {
  Pending: "#ff9800",
  Processed: "#1976d2",
  Rejected: "#d32f2f",
  Resolved: "#2e7d32",
  Approved: "#217346",
  Paid: "#6b6f80",
};

export const NemsasManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNemsasClaimModal, setShowNemsasClaimModal] = useState(false);
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [patientNumberFilter, setPatientNumberFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isPatientSearchMode, setIsPatientSearchMode] = useState(false);
  

  const NEMSAS_ID = "2e4c6fa4-6ac3-43bb-b78f-326dccac110c";

  const {
    claims: reduxClaims,
    loading,
    error,
  } = useAppSelector((state) => state.nemsas);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const routeToEmergencyBillPage = () => {
    navigate("/emergency/bill-capture")
  }

  // Get user data from Redux auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { selectedProviderId } = useProviderContext();

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");

  // Add this currency formatting function
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "0.00";
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  // Adapt mapping to new NEMSAS response schema
  interface NemsasClaimItem {
    id: string;
    amount: number;
    status?: number | string;
    claimStatus?: number | string;
  }

  interface NemsasClaimRaw {
    id: string;
    claimName?: string;
    patientName?: string;
    patientNumber?: string;
    patientEnrolleeNumber?: string;
    serviceDate?: string;
    amount?: number;
    claimStatus?: number | string;
    claimItems?: NemsasClaimItem[];
    serviceType?: string;
  }

  // Map Redux claims to table format
  const tableClaims = useMemo(() => {
    return (reduxClaims || []).map((claim: NemsasClaimRaw, index) => {
      // Derive total amount from claimItems if top-level amount missing
      const totalAmount = Array.isArray(claim.claimItems)
        ? claim.claimItems.reduce(
            (sum: number, item: NemsasClaimItem) => sum + (item?.amount || 0),
            0
          )
        : claim.amount || 0;

      // Derive status
      const rawStatus: string | number | undefined =
        Array.isArray(claim.claimItems) && claim.claimItems.length > 0
          ? claim.claimItems[0].claimStatus ?? claim.claimItems[0].status
          : claim.claimStatus;

      return {
        id: claim.id || "N/A",
        sn: index + 1,
        name: claim.claimName || claim.patientName || "N/A",
        patientNumber:
          claim.patientNumber || claim.patientEnrolleeNumber || "N/A",
        serviceType: claim.serviceType || "N/A",
        date: claim.serviceDate
          ? new Date(claim.serviceDate).toLocaleDateString()
          : "N/A",
        rawDate: claim.serviceDate || "",
        amount: totalAmount,
        formattedAmount: `₦${formatCurrency(totalAmount)}`,
        status: getClaimStatusText(rawStatus),
        rawStatus: getClaimStatusText(rawStatus),
      };
    });
  }, [reduxClaims]);

  // General claims fetch (ignores patientNumberFilter)
const loadClaims = useCallback(() => {
  // If we're in patient search mode, don't override with general fetch
  if (isPatientSearchMode) return;

  const providerIdToUse = currentUser?.providerId;
  if (!providerIdToUse) {
    console.error("No providerId on current user");
    return;
  }

  dispatch(
    fetchNemsasClaims({
      ProviderId: providerIdToUse,
      NEMSASId: NEMSAS_ID,
      StartDate: startDate ? new Date(startDate).toISOString() : undefined,
      EndDate: endDate ? new Date(endDate).toISOString() : undefined,
      ClaimStatus: claimStatus || undefined,
      PageNumber: 1,
      PageSize: 500,
      SortBy: "createdDate",
    })
  );
}, [dispatch, currentUser?.providerId, startDate, endDate, claimStatus, isPatientSearchMode]);

  // Patient-specific search triggered only by button
const searchByPatient = useCallback(() => {
  const providerIdToUse = currentUser?.providerId;
  if (!providerIdToUse || !patientNumberFilter.trim()) return;

  setIsPatientSearchMode(true); // Switch to patient-only mode

  dispatch(
    fetchNemsasClaimsByPatient({
      patientNumber: patientNumberFilter.trim(),
      ProviderId: providerIdToUse,
    })
  );
}, [dispatch, currentUser?.providerId, patientNumberFilter]);

// New: Clear patient search and go back to normal list
const clearPatientSearch = useCallback(() => {
  setPatientNumberFilter("");
  setIsPatientSearchMode(false);
  loadClaims(); // Reload full list with current filters
}, [loadClaims]);

  // Load claims when component mounts AND when currentUser is available
  useEffect(() => {
    if (currentUser) {
      loadClaims();
    }
  }, [loadClaims, currentUser]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Define columns
  const columns: ColumnDef<(typeof tableClaims)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "name",
      header: "Patient Name",
      enableSorting: true,
    },
    {
      accessorKey: "patientNumber",
      header: "Patient Number",
      enableSorting: true,
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      enableSorting: true,
    },
    {
      accessorKey: "date",
      header: "Service Date",
      enableSorting: true,
    },
    {
      accessorKey: "formattedAmount",
      header: "Total Amount",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          style={{
            color:
              statusColor[row.original.status as keyof typeof statusColor] ||
              "#000",
            fontWeight: 600,
          }}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: "action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          // variant="outline"
          // size="sm"
          className="h-auto py-1 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedClaimId(row.original.id);
            setShowDetailsModal(true);
          }}
        >
          View
        </button>
      ),
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: tableClaims,
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

  // Export function
  const exportClaimsReport = async (options: { IsExcel: boolean }) => {
    const response = await exportNemsasClaimsReportApi(options);
    return response;
  };

  // Show loading while waiting for user data
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser?.providerId) {
    return (
      <div className="p-6 text-center">
        No providerId found on logged in user. Please re-login or contact
        support.
      </div>
    );
  }

  return (
    <>
    <div className="p-6">
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="bg-white rounded-md flex flex-col mb-36">
          {/* Header */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <FormHeader>NEMSAS Claims Management</FormHeader>
              <input
                type="text"
                placeholder="Search claims"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  table.setColumnFilters([
                    {
                      id: "name",
                      value: e.target.value,
                    },
                  ]);
                }}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
              >
                Export
              </Button>
              <button
                onClick={routeToEmergencyBillPage}
                   title="Create Emergency Bill"
                className="text-red-600 bg-white hover:bg-gray-100 border border-red-600 px-3 py-2 rounded-md transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 pb-4 border-b">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#555]">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-[#ccc] rounded-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#555]">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-[#ccc] rounded-sm"
                />
              </div>
             <div className="flex flex-col gap-1">
  <label className="text-sm text-[#555]">Patient Number</label>
  <div className="flex gap-2 items-center">
    <input
      type="text"
      value={patientNumberFilter}
      onChange={(e) => setPatientNumberFilter(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && patientNumberFilter.trim() && searchByPatient()}
      placeholder="Enter patient number"
      className="p-2 border border-[#ccc] rounded-sm min-w-48"
      disabled={loading}
    />
    {isPatientSearchMode ? (
      <Button variant="outline" onClick={clearPatientSearch} className="whitespace-nowrap">
        Clear Search
      </Button>
    ) : (
      <Button
        variant="outline"
        onClick={searchByPatient}
        disabled={!patientNumberFilter.trim() || loading}
      >
        Search Patient
      </Button>
    )}
  </div>

</div>
              <div className="flex gap-1">
                <Button variant="outline"   onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setClaimStatus("");
                    setPatientNumberFilter("");
                    setSearchTerm("");
                    table.setColumnFilters([]);
                  }}>
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                
                   onClick={loadClaims}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-10">
                <div>{error}</div>
                <Button onClick={loadClaims} className="mt-4">
                  Retry Loading Claims
                </Button>
              </div>
            ) : tableClaims.length === 0 ? (
              <EmptyState
                icon={<span className="text-2xl">📄</span>}
                title="No claims available yet"
                description="No claims found for your provider."
                action={
                  <Button onClick={() => setShowCreateModal(true)}>
                    + Create a new patient and Emergency Bill
                  </Button>
                }
              />
            ) : (
              <>
                {/* Table */}
                <div className="flex-1 lg:px-0 lg:mt-4">
                  <Table className="min-w-[800px]">
                    <TableHeader className="border-y border-[#CDE5F9]">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
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
                            onClick={() => {
                              setSelectedClaimId(row.original.id);
                              setShowDetailsModal(true);
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
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
                            className="h-24 text-center"
                          >
                            <div className="flex flex-col items-center gap-4">
                              <span className="font-medium">
                                No claims found
                              </span>
                              <span className="font-medium">
                                Try adjusting your search criteria
                              </span>
                              <Button onClick={() => setShowCreateModal(true)}>
                                + Create new claim
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-end">
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="How would you like to submit your claims?"
        width="400px"
      >
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowNemsasClaimModal(true);
              setShowCreateModal(false);
            }}
          >
            Single claim
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowBatchUploadModal(true);
              setShowCreateModal(false);
            }}
          >
            Batch upload
          </Button>
          {/* <Button variant="outline">Generate from HMIS</Button> */}
        </div>
      </Modal>

      <NemsasModal
        open={showNemsasClaimModal}
        onClose={() => setShowNemsasClaimModal(false)}
        onSubmitted={() => {
          loadClaims();
        }}
      />

      <BatchUploadModal
        open={showBatchUploadModal}
        onClose={() => setShowBatchUploadModal(false)}
      />

      <NemsasClaimDetailsModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedClaimId(null);
        }}
        claimId={selectedClaimId}
      />

      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Claims"
        width="350px"
      >
        <div className="flex flex-col gap-4">
          <Button
            onClick={async () => {
              setExportLoading(true);
              setExportError("");
              try {
                const blob = await exportClaimsReport({ IsExcel: false });
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "claims.csv");
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                setShowExportModal(false);
              } catch {
                setExportError("Failed to export CSV");
              }
              setExportLoading(false);
            }}
            disabled={exportLoading}
          >
            Export as CSV
          </Button>
          <Button
            onClick={async () => {
              setExportLoading(true);
              setExportError("");
              try {
                const blob = await exportClaimsReport({ IsExcel: true });
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "claims.xlsx");
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                setShowExportModal(false);
              } catch {
                setExportError("Failed to export Excel");
              }
              setExportLoading(false);
            }}
            disabled={exportLoading}
          >
            Export as Excel
          </Button>
          {exportLoading && <div className="text-center p-2">Exporting...</div>}
          {exportError && (
            <div className="text-center p-2 text-red-500">{exportError}</div>
          )}
        </div>
      </Modal>
    </div>
    </>
  );
};
