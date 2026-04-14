import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../services/store/store";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useAppDispatch } from "../../../hooks/redux";
import { useProviderContext } from "../../../context/useProviderContext";

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
import { useNavigate } from "react-router-dom";
import { fetchEmergencyClaims } from "../../../services/thunks/emergencyClaimThunk";
import { clearError } from "../../../services/slices/emergencyClaimSlice";
import { Share, FileText, Users, Eye } from "lucide-react";
// Files export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../../utils/pdfFont";
import FormHeader from "../../../components/form/FormHeader";
import VetSuccessModal from "../../../components/ui/VetSuccessModal";
import { submitVettingClaim } from "../../../services/thunks/vettingClaimThunk";
import VetConfirmModal from "../../../components/ui/VetSuccessModal";
import { useCustomToast } from "../../../hooks/useCustomToast";

// Status color map
const statusColor: Record<string, string> = {
  Pending: "#ff9800",
  Processing: "#1976d2",
  Rejected: "#d32f2f",
  Approved: "#2e7d32",
  Paid: "#6b6f80",
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
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const StateClaims = () => {
  // Step 2: Replace local providerId state with context
  const { selectedProviderId } = useProviderContext();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const toast = useCustomToast();

  // Get emergency claims from Redux store
  const {
    claims: emergencyClaims,
    loading,
    error,
    // successMessage
  } = useSelector((state: RootState) => state.emergencyClaim);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user data from Redux auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Step 3: Set provider ID based on user type
  const providerId = useMemo(() => {
    if (!currentUser) return "";

    // Provider user → always use their own providerId
    if (currentUser.orgType === "Provider") {
      return currentUser.providerId || "";
    }

    // SSHIA user → use selected provider from dropdown
    return selectedProviderId || "";
  }, [currentUser, selectedProviderId]);

  // Step 4: Keep SSHIA ID from user
  const sshiaId = currentUser?.hmoId || "";

  const handleOpenApproveModal = () => {
    if (selectedRows.length !== 1) {
      toast.error("Please select exactly one claim to approve");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleApproveClaims = async () => {
    const selectedData = selectedRows.map((row) => row.original);

    setApprovalLoading(true);

    try {
      await Promise.all(
        selectedData.map((claim) =>
          dispatch(
            submitVettingClaim({
              claimId: claim.id,
              providerId: providerId,
              emergencyClaimId: claim.id,
              remark: "This Claim has been vetted",
              status: "Vetted",
            }),
          ).unwrap(),
        ),
      );

      setShowConfirmModal(false); //  close confirm modal
      setShowSuccessModal(true); //  show success modal
      setRowSelection({});
      loadClaims();

      toast.success("Claims approved successfully");
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Failed to approve claims");
    } finally {
      setApprovalLoading(false);
    }
  };

  // file export
  const exportTableToPDF = (
    tableData: any[],
    fileName = "emergencyclaims.pdf",
  ) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // set unicode font
    doc.setFont("Roboto", "normal");

    doc.setFontSize(16);
    doc.text("Emergency Claims Report", 14, 12);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 18);

    const rows = tableData.map((claim, i) => [
      i + 1,
      claim.description,
      // claim.claimType,
      claim.claimNumber,
      claim.date,
      claim.formattedAmount.replace("₦", "NGN "),
      claim.formattedVettedAmount.replace("₦", "NGN "),
      claim.status,
      claim.createdDate,
    ]);

    autoTable(doc, {
      startY: 24,
      head: [
        [
          "S/N",
          "Description",
          "Claim Type",
          "Claim Date",
          "Submitted",
          "Vetted",
          "Status",
          "Created",
        ],
      ],
      body: rows,

      styles: {
        font: "Roboto",
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
      },

      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 },
        6: { cellWidth: 35 },
        7: { cellWidth: 35 },
      },

      theme: "grid",
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
      },
    });

    doc.save(fileName);
  };

  // Step 5: Update loadClaims
  const loadClaims = useCallback(() => {
    if (providerId && sshiaId) {
      dispatch(fetchEmergencyClaims({ providerId, SSHIAId: sshiaId, status: "Pending" }));
    }
  }, [dispatch, providerId, sshiaId]);

  // Step 6: Auto refetch when provider changes
  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Map emergency claims to table format
  const tableClaims = useMemo(() => {
    return (emergencyClaims || []).map((claim, index) => ({
      id: claim.id,
      sn: index + 1,
      description: claim.description,
      // claimType: claim.claimType,
      claimNumber: claim.claimNumber,
      date: formatDate(claim.date),
      rawDate: claim.date,
      submittedAmount: claim.submittedAmount,
      formattedAmount: formatCurrency(claim.submittedAmount),
      vettedAmount: claim.vettedAmount,
      formattedVettedAmount: formatCurrency(claim.vettedAmount),
      status: claim.status,
      createdDate: formatDate(claim.createdDate),
      emergencyBillCount: claim.emergencyBillIds?.length || 0,
    }));
  }, [emergencyClaims]);

  // Define columns based on emergency claim schema
  const columns: ColumnDef<(typeof tableClaims)[0]>[] = [
    // {
    //   accessorKey: "sn",
    //   header: "S/N",
    //   size: 60,
    // },
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={() => {
            setRowSelection({ [row.id]: true });
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: true,
    },
    // {
    //   accessorKey: "claimType",
    //   header: "Claim Type",
    //   enableSorting: true,
    // },
    {
      accessorKey: "claimNumber",
      header: "Claim Number",
      enableSorting: true,
    },
    {
      accessorKey: "date",
      header: "Claim Date",
      enableSorting: true,
    },
    {
      accessorKey: "formattedAmount",
      header: "Submitted Amount",
      enableSorting: true,
    },
    {
      accessorKey: "formattedVettedAmount",
      header: "Vetted Amount",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          style={{
            color: statusColor[row.original.status] || "#000",
            fontWeight: 600,
          }}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      enableSorting: true,
    },

    // In StateClaims component, update the action column to include the selectedProviderId
    {
      id: "action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // IMPORTANT: Use the providerId that's being used to fetch claims
            // This providerId already includes the selectedProviderId from context
            navigate(`/state/emergency/claims/${row.original.id}`, {
              state: {
                claimNumber: row.original.claimNumber,
                providerId: providerId, // This already has the selectedProviderId from context
                claimId: row.original.id,
              },
            });
          }}
        >
          <Eye className="h-5 w-5" />
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
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      const selectedKeys = Object.keys(newSelection);

      if (selectedKeys.length > 1) {
        // keep only the last selected row
        const lastSelectedKey = selectedKeys[selectedKeys.length - 1];
        setRowSelection({ [lastSelectedKey]: true });
      } else {
        setRowSelection(newSelection);
      }
    },
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

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  // Calculate stats
  const totalAmount = useMemo(() => {
    const total = tableClaims.reduce(
      (sum, claim) => sum + (claim.submittedAmount || 0),
      0,
    );
    if (total >= 1000000) return `${(total / 1000000).toFixed(2)}M`;
    if (total >= 1000) return `${(total / 1000).toFixed(0)}K`;
    return total.toString();
  }, [tableClaims]);

  const numOfClaims = tableClaims.length;

  const billAccuracy = 75; // This would be calculated from actual data

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
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 bg-grey rounded-lg shadow-sm p-6">
          {/* Total Amount Card */}
          <div className="bg-[#E4F7F0] rounded-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#C4F2E1] rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalAmount}</p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
          </div>

          {/* Total Patient Card */}
          <div className="bg-[#DB84000D] rounded-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{numOfClaims}</p>
              <p className="text-sm text-gray-500">Total Claims</p>
            </div>
          </div>

          {/* Bill Accuracy Card */}
          <div className="bg-[#EDEDFD] rounded-lg  p-6 flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500">Total Vetted</p>
            </div>
          </div>

          <div className="bg-[#FDEDED] rounded-lg  p-6 flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Total Disputed</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-gray-100 overflow-scroll h-full">
          <div className="bg-white rounded-md flex flex-col mb-36">
          
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center p-6">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-8">
                  <FormHeader>Claims</FormHeader>
                </div>
                <input
                  type="text"
                  placeholder="Search claims by description"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    table.setColumnFilters([
                      {
                        id: "description",
                        value: e.target.value,
                      },
                    ]);
                  }}
                  className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
                />
              </div>
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => exportTableToPDF(tableClaims)}
                  className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-sm text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition"
                >
                  <Share className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Step 7: REMOVED the manual input section */}

            {/* Success/Error Messages */}
            {/* {successMessage && (
            <div className="px-6 py-3 bg-green-50 border-l-4 border-green-500">
              <p className="text-green-700">{successMessage}</p>
            </div>
          )} */}

            {error && (
              <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500">
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={loadClaims}
                  className="mt-2 text-red-600 hover:text-red-700"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Content */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              ) : // Step 8: Update empty state logic
              !providerId ? (
                <div className="text-center py-10">
                  <div className="text-gray-500 mb-4">
                    {currentUser.orgType === "Provider"
                      ? "Provider ID not found. Please contact support."
                      : "Please select a provider from the dropdown to view claims"}
                  </div>
                </div>
              ) : tableClaims.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">📄</span>}
                  title="No emergency claims available"
                  description={
                    error
                      ? "Failed to load claims"
                      : "No claims found for the selected provider."
                  }
                  // action={
                  //   <Button onClick={() => navigate("/create-claim")}>
                  //     + Create New Emergency Claim
                  //   </Button>
                  // }
                />
              ) : (
                <>
                  {hasSelection && (
                    <div className="flex items-center justify-between px-6 py-3 bg-green-50 border-b">
                      <p className="text-sm text-gray-700">
                        {selectedRows.length} item(s) selected
                      </p>

                      <div className="flex gap-3">
                        <Button
                          color="green"
                          onClick={handleOpenApproveModal}
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          Approve Claims
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setRowSelection({})}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Table */}
                  <div className="flex-1 lg:px-0 lg:mt-4">
                    <Table className="min-w-[1000px]">
                      <TableHeader className="border-y border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
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
                              // onClick={() => {
                              //   // Navigate to claim details or open modal
                              //   navigate(
                              //     `/emergency/claims/${row.original.id}`,
                              //     {
                              //       state: {
                              //         claimNumber: row.original.claimNumber,
                              //       },
                              //     },
                              //   );
                              // }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
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
                                <span className="text-gray-500">
                                  Try adjusting your search criteria
                                </span>
                                <Button>+ Create new claim</Button>
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

        <VetConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleApproveClaims}
          title="Confirm Approval"
          message={`Are you sure you want to approve claim? This action cannot be undone.`}
          confirmText="Yes, Approve"
          cancelText="Cancel"
          isLoading={approvalLoading}
        />
      </div>
    </>
  );
};
