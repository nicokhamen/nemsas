import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, Eye, Share, Search } from "lucide-react";
import type { RootState } from "../../../services/store/store";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useAppSelector, useAppDispatch } from "../../../hooks/redux";

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

// Files export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../../utils/pdfFont";
import { fetchClaimsTracking } from "../../../services/thunks/claimTrackingThunk";
// import { ClaimDetailsModal } from "./ClaimDetailsModal";
import { ClaimDetailsModal, type Claim } from "./ClaimDetailsModal";

// Define Claim type based on the schema
// interface Claim {
//   id: string;
//   description: string;
//   claimType: string;
//   date: string;
//   claimNumber: string;
//   status: string;
//   vettedAmount: number;
//   submittedAmount: number;
//   submittedDate: string;
//   vettedDate: string;
//   createdDate: string;
//   isActive: boolean;
//   providerId: string;
//   sshiaId: string;
// }

interface ClaimsResponse {
  data: Claim[];
  message: string;
  isSuccess: boolean;
}

// Custom filter function for searching across multiple fields
const multiFieldFilter = (row: any, _columnId: string, filterValue: string) => {
  if (!filterValue) return true;

  const searchTerm = filterValue.toLowerCase();
  const claimNumber = (row.getValue("claimNumber") || "").toLowerCase();
  const description = (row.getValue("description") || "").toLowerCase();
  const claimType = (row.getValue("claimType") || "").toLowerCase();

  return (
    claimNumber.includes(searchTerm) ||
    description.includes(searchTerm) ||
    claimType.includes(searchTerm)
  );
};

// Format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
};

// Format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Export to PDF function
const exportTableToPDF = (tableData: any[], fileName = "claims.pdf") => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("Roboto", "normal");

  doc.setFontSize(16);
  doc.text("Claims Report", 14, 12);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 18);

  const rows = tableData.map((claim, i) => [
    i + 1,
    claim.claimNumber || "N/A",
    claim.description || "N/A",
    claim.claimType || "N/A",
    claim.status || "N/A",
    formatCurrency(claim.submittedAmount),
    formatCurrency(claim.vettedAmount),
    formatDate(claim.submittedDate),
    formatDate(claim.vettedDate),
  ]);

  autoTable(doc, {
    startY: 24,
    head: [
      [
        "S/N",
        "Claim ID",
        "Submitted Date",
        "Claim Type",
        "Claim Description",
        "Status",
        "Submitted Amount",
        "Vetted Amount",
        "Vetted Date",
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
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 },
      6: { cellWidth: 35 },
      7: { cellWidth: 30 },
      8: { cellWidth: 30 },
    },
    theme: "grid",
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: 255,
    },
  });

  doc.save(fileName);
};

// Get status badge color
const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const ClaimsTracking = () => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [claimTypeFilter, setClaimTypeFilter] = useState("All");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  // Get claims state from Redux
  const claimsState = useAppSelector((state: any) => state.claimTracking);
  const claims = claimsState?.data || [];
  const loading = claimsState?.loading || false;
  const error = claimsState?.error || null;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user data from Redux auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Handle view claim
  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  // Load claims
  const loadClaims = useCallback(() => {
    dispatch(fetchClaimsTracking());
  }, [dispatch]);

  // Load claims when component mounts
  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Map claims to table format
  const tableClaims = useMemo(() => {
    return (claims || []).map((claim: Claim, index: number) => {
      return {
        id: claim.id || `claim-${index}`,
        sn: index + 1,
        claimNumber: claim.claimNumber || "N/A",
        description: claim.description || "N/A",
        claimType: claim.claimType || "N/A",
        status: claim.status || "N/A",
        submittedAmount: claim.submittedAmount || 0,
        vettedAmount: claim.vettedAmount || 0,
        submittedDate: claim.submittedDate,
        vettedDate: claim.vettedDate,
        createdDate: claim.createdDate,
        isActive: claim.isActive,
        rawClaim: claim,
      };
    });
  }, [claims]);

  // Define columns based on claim schema
  const columns: ColumnDef<(typeof tableClaims)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "claimNumber",
      header: "Claim ID",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "description",
      header: "Claim Description",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "claimType",
      header: "Claim Type",
      enableSorting: true,
      filterFn: multiFieldFilter,
      cell: ({ row }) => {
        const claimType = row.getValue("claimType") as string;
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {claimType}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      filterFn: (row, columnId, value) => {
        if (value === "All") return true;
        return row.getValue(columnId) === value;
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(status)}`}
          >
            {status}
          </span>
        );
      },
    },
    // {
    //   accessorKey: "submittedAmount",
    //   header: "Submitted Amount",
    //   enableSorting: true,
    //   cell: ({ row }) => formatCurrency(row.getValue("submittedAmount")),
    // },
    // {
    //   accessorKey: "vettedAmount",
    //   header: "Vetted Amount",
    //   enableSorting: true,
    //   cell: ({ row }) => formatCurrency(row.getValue("vettedAmount")),
    // },
    // {
    //   accessorKey: "submittedDate",
    //   header: "Submitted Date",
    //   enableSorting: true,
    //   cell: ({ row }) => formatDate(row.getValue("submittedDate")),
    // },
    // {
    //   accessorKey: "vettedDate",
    //   header: "Vetted Date",
    //   enableSorting: true,
    //   cell: ({ row }) => formatDate(row.getValue("vettedDate")),
    // },
    {
      id: "action",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleViewClaim(row.original.rawClaim);
          }}
          title="View Claim"
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

  // Apply filters
  useEffect(() => {
    if (statusFilter === "All") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(statusFilter);
    }
  }, [statusFilter, table]);

  useEffect(() => {
    if (claimTypeFilter === "All") {
      table.getColumn("claimType")?.setFilterValue(undefined);
    } else {
      table.getColumn("claimType")?.setFilterValue(claimTypeFilter);
    }
  }, [claimTypeFilter, table]);

  // Get unique claim types for filter dropdown
  const uniqueClaimTypes = useMemo(() => {
    const types = new Set<string>();
    claims.forEach((claim: Claim) => {
      if (claim.claimType) types.add(claim.claimType);
    });
    return Array.from(types);
  }, [claims]);

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
      <div className="p-6">
        <div className="bg-gray-100 overflow-scroll h-full">
          <div className="bg-white rounded-md flex flex-col mb-36">
            {/* Filters */}
            <div className="p-6 border-b bg-white">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Filter By
              </h3>

              <div className="grid grid-cols-12 gap-4 items-end">
            
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Claims
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by claim number, description..."
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        table.getColumn("claimNumber")?.setFilterValue(value);
                      }}
                      className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

          
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none bg-white"
                  >
                    <option value="All">All</option>
                    <option value="New">New</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

             
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                  />
                </div>

               
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                  />
                </div>

             
                <div className="col-span-3 flex gap-3">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                      setClaimTypeFilter("All");
                      setStartDate("");
                      setEndDate("");
                      table.setColumnFilters([]);
                      loadClaims();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => {
                      loadClaims();
                    }}
                    className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Apply filter
                  </button>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center py-6 px-6 bg-gray-50">
              <label className="text-lg font-semibold text-gray-700">
                Claims
              </label>
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => exportTableToPDF(tableClaims)}
                  className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition"
                >
                  <Share className="h-4 w-4" />
                  Export
                </button>
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
                  icon={<span className="text-2xl">📋</span>}
                  title="No claims available yet"
                  description="No claims found in the system."
                />
              ) : (
                <>
                  {/* Table */}
                  <div className="flex-1 lg:px-0 lg:mt-4">
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-[#E4F7F1] hover:bg-[#E4F7F1] transition-colors">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow
                            key={headerGroup.id}
                            className="hover:bg-[#E4F7F1] transition-colors border-b border-[#E4F7F1]"
                          >
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
                              className="cursor-pointer hover:bg-[#FFFFFF] transition-colors"
                              onClick={() => {
                                handleViewClaim(row.original.rawClaim);
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
                              className="h-24 text-center hover:bg-[#FFFFFF] transition-colors"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <span className="font-medium">
                                  No claims found
                                </span>
                                <span className="font-medium">
                                  Try adjusting your search criteria
                                </span>
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

      {isModalOpen && selectedClaim && (
        <ClaimDetailsModal claim={selectedClaim} onClose={handleCloseModal} />
      )}
    </>
  );
};
