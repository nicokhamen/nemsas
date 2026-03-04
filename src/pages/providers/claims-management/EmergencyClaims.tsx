import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../services/store/store";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
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
import { useNavigate } from "react-router-dom";
import { fetchEmergencyClaims } from "../../../services/thunks/emergencyClaimThunk";
import { clearError } from "../../../services/slices/emergencyClaimSlice";
import { Share, FileText, Users, Eye } from "lucide-react";
// Files export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../../utils/pdfFont";

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

export const Claims = () => {
  const [providerId, setProviderId] = useState<string>("");
  const [sshiaId, setSshiaId] = useState<string>("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
  // Initialize providerId and sshiaId from current user if available
  useEffect(() => {
    if (currentUser?.providerId) {
      setProviderId(currentUser.providerId);
      // If SSHIA ID is available from user, set it too
      if (currentUser.hmoId) {
        setSshiaId(currentUser.hmoId);
      }
    }
  }, [currentUser]);

  // Load claims when providerId and sshiaId are available
  const loadClaims = useCallback(() => {
    if (providerId && sshiaId) {
      dispatch(fetchEmergencyClaims({ providerId, SSHIAId: sshiaId }));
    }
  }, [dispatch, providerId, sshiaId]);

  // Load claims when component mounts or IDs change
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
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
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
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => (
    //     <span
    //       style={{
    //         color: statusColor[row.original.status] || "#000",
    //         fontWeight: 600,
    //       }}
    //     >
    //       {row.original.status}
    //     </span>
    //   ),
    //   enableSorting: true,
    // },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      enableSorting: true,
    },
    // {
    //   accessorKey: "emergencyBillCount",
    //   header: "Bills",
    //   cell: ({ row }) => (
    //     <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
    //       {row.original.emergencyBillCount}
    //     </span>
    //   ),
    // },
    {
      id: "action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();

            navigate(`/emergency/claims/${row.original.id}`);
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

  // Handle form submission for provider/SSHIA IDs
  const handleSubmitIds = (e: React.FormEvent) => {
    e.preventDefault();
    if (providerId && sshiaId) {
      loadClaims();
    }
  };

  // Navigate to create new claim
  // const navigateToCreateClaim = () => {
  //   navigate("/emergency/claims/create");
  // };

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
        <div className="grid grid-cols-3 gap-6 bg-grey rounded-lg shadow-sm p-6">
          {/* Total Amount Card */}
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#C4F2E1] rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalAmount}</p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
          </div>

          {/* Total Patient Card */}
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{numOfClaims}</p>
              <p className="text-sm text-gray-500">Total Claims</p>
            </div>
          </div>

          {/* Bill Accuracy Card */}
          <div className="bg-white rounded-lg  p-6 flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">70%</p>
              <p className="text-sm text-gray-500">Bill Accuracy</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-gray-100 overflow-scroll h-full">
          <div className="bg-white rounded-md flex flex-col mb-36">
            <div className="p-6 space-y-4">
              {/* Filter By header */}
              <h3 className="text-lg font-semibold text-gray-700">Filter By</h3>

              {/* Filter controls in a row */}
              <div className="flex flex-wrap gap-4 justify-between items-end">
                {/* Date Range inputs */}
                <div className="flex-1 max-w-4xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                      placeholder="Start date"
                    />
                    <span className="text-sm text-gray-500 font-medium">
                      To
                    </span>
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                      placeholder="End date"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 min-w-[240px]">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      table.setColumnFilters([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      // Apply filters
                    }}
                    className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-sm hover:bg-red-700 transition-colors font-medium"
                  >
                    Apply filter
                  </button>
                </div>
              </div>
            </div>
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center p-6">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-8">
                  <label className="block text-lg  text-gray-700 mb-2">
                    All Claims
                  </label>
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

            {/* Provider/SSHIA ID Input Section */}
            {(!providerId || !sshiaId) && (
              <div className="px-6 pb-6 border-b">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Enter Provider and SSHIA IDs
                  </h3>
                  <form
                    onSubmit={handleSubmitIds}
                    className="flex flex-wrap gap-4 items-end"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">
                        Provider ID
                      </label>
                      <input
                        type="text"
                        value={providerId}
                        onChange={(e) => setProviderId(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md min-w-64"
                        placeholder="Enter Provider ID"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">SSHIA ID</label>
                      <input
                        type="text"
                        value={sshiaId}
                        onChange={(e) => setSshiaId(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md min-w-64"
                        placeholder="Enter SSHIA ID"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={!providerId || !sshiaId}>
                      Load Claims
                    </Button>
                  </form>
                  <p className="text-sm text-gray-500 mt-2">
                    These IDs are required to fetch emergency claims from the
                    API.
                  </p>
                </div>
              </div>
            )}

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
              ) : !providerId || !sshiaId ? (
                <div className="text-center py-10">
                  <div className="text-gray-500 mb-4">
                    Please enter Provider ID and SSHIA ID to view claims
                  </div>
                </div>
              ) : tableClaims.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">📄</span>}
                  title="No emergency claims available"
                  description={
                    error
                      ? "Failed to load claims"
                      : "No claims found for the provided IDs."
                  }
                  action={
                    <Button onClick={() => navigate("/create-claim")}>
                      + Create New Emergency Claim
                    </Button>
                  }
                />
              ) : (
                <>
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
                              onClick={() => {
                                // Navigate to claim details or open modal
                                navigate(
                                  `/emergency/claims/${row.original.id}`,
                                );
                              }}
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
      </div>
    </>
  );
};
