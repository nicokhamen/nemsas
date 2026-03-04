import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../services/store/store";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useAppDispatch } from "../../../hooks/redux";
import { clearError } from "../../../services/slices/emergencyClaimSlice";
import { fetchEmergencyClaims } from "../../../services/thunks/emergencyClaimThunk";
import { Search, Filter, Upload, Eye, FileText, Users, PieChart } from "lucide-react";

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

// Status color map
const statusColor: Record<string, string> = {
  "Awaiting Review": "#D97706",
  "Pending PIU Review": "#D97706",
  Pending: "#D97706",
  Processing: "#1976d2",
  Rejected: "#d32f2f",
  Approved: "#2e7d32",
  Vetted: "#059669",
  Paid: "#6b6f80",
};

// Circular Progress Component
const CircularProgress = ({ 
  percentage, 
  pathColor = "#DC2626", 
  textColor = "#374151", 
  bgColor = "#FEE2E2" 
}: { 
  percentage: number; 
  pathColor?: string; 
  textColor?: string; 
  bgColor?: string; 
}) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const size = 56;
  const center = size / 2;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={pathColor}
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span 
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
        style={{ color: textColor }}
      >
        {percentage}%
      </span>
    </div>
  );
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

export const MDReview = () => {
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
  } = useSelector((state: RootState) => state.emergencyClaim);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user data from Redux auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

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

  // Calculate processing delay
  const calculateProcessingDelay = (createdDate: string): string => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}days ${diffHours}hr ${diffMins}min`;
    } else if (diffHours > 0) {
      return `${diffHours}hr ${diffMins}min`;
    }
    return `${diffMins}min`;
  };

  // Map emergency claims to table format
  const tableClaims = useMemo(() => {
    return (emergencyClaims || []).map((claim, index) => ({
      id: claim.id,
      sn: index + 1,
      claimId: `FCT/ETC/${String(index + 2).padStart(3, '0')}`,
      description: claim.description,
      claimType: claim.claimType || "ETC",
      date: formatDate(claim.date),
      rawDate: claim.date,
      submittedAmount: claim.submittedAmount,
      formattedAmount: formatCurrency(claim.submittedAmount),
      vettedAmount: claim.vettedAmount,
      formattedVettedAmount: formatCurrency(claim.vettedAmount),
      vettedDate: formatDate(claim.createdDate),
      status: claim.status,
      processingDelay: calculateProcessingDelay(claim.createdDate),
      emergencyBillCount: claim.emergencyBillIds?.length || 0,
    }));
  }, [emergencyClaims]);

  const routeToEmergencyBillPage = () => {
    navigate("/emergency/bill-capture");
  };

  // Handle navigation to MdReviewBills page when a claim is clicked
  const handleClaimClick = (claimId: string) => {
    navigate(`/md-review/${claimId}`);
  };

  // Define columns based on design
  const columns: ColumnDef<(typeof tableClaims)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "claimId",
      header: "Claim ID",
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: "Claim Description",
      enableSorting: true,
    },
    {
      accessorKey: "claimType",
      header: "Claim Type",
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: "date",
      header: "Date",
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
      accessorKey: "vettedDate",
      header: "Vetted Date",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          style={{
            color: statusColor[row.original.status] || "#D97706",
            fontWeight: 500,
          }}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "processingDelay",
      header: "Processing Delay",
      enableSorting: true,
    },
    {
      id: "action",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/md-review/${row.original.id}`);
          }}
          title="View Details"
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

  // Map table data to match the columns displayed in the UI
  const rows = tableData.map((claim, i) => [
    i + 1, // S/N
    claim.claimId || `FCT/ETC/${String(i + 2).padStart(3, '0')}`, // Claim ID
    claim.description || "N/A", // Claim Description
    claim.claimType || "ETC", // Claim Type
    claim.date || "N/A", // Date
    claim.formattedAmount?.replace("₦", "NGN ") || "NGN 0.00", // Submitted Amount
    claim.formattedVettedAmount?.replace("₦", "NGN ") || "NGN 0.00", // Vetted Amount
    claim.vettedDate || "N/A", // Vetted Date
    claim.status || "N/A", // Status
    claim.processingDelay || "0min", // Processing Delay
  ]);

  autoTable(doc, {
    startY: 24,
    head: [
      [
        "S/N",
        "Claim ID",
        "Description",
        "Claim Type",
        "Claim Date",
        "Submitted Amount",
        "Vetted Amount",
        "Vetted Date",
        "Status",
        "Processing Delay",
      ],
    ],
    body: rows,

    styles: {
      font: "Roboto",
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },

    columnStyles: {
      0: { cellWidth: 10 }, // S/N
      1: { cellWidth: 25 }, // Claim ID
      2: { cellWidth: 35 }, // Description
      3: { cellWidth: 20 }, // Claim Type
      4: { cellWidth: 20 }, // Claim Date
      5: { cellWidth: 25 }, // Submitted Amount
      6: { cellWidth: 25 }, // Vetted Amount
      7: { cellWidth: 20 }, // Vetted Date
      8: { cellWidth: 20 }, // Status
      9: { cellWidth: 20 }, // Processing Delay
    },

    theme: "grid",
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    
    // Add alternating row colors for better readability
    bodyStyles: {
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    
    // Handle long text wrapping
    // didDrawCell: (data) => {
    
    // },
  });

  

  doc.save(fileName);
};

  // Handle form submission for provider/SSHIA IDs
  const handleSubmitIds = (e: React.FormEvent) => {
    e.preventDefault();
    if (providerId && sshiaId) {
      loadClaims();
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

  // Calculate stats
  const totalAmount = useMemo(() => {
    const total = tableClaims.reduce((sum, claim) => sum + (claim.submittedAmount || 0), 0);
    if (total >= 1000000) return `${(total / 1000000).toFixed(2)}M`;
    if (total >= 1000) return `${(total / 1000).toFixed(0)}K`;
    return total.toString();
  }, [tableClaims]);

  const numOfClaims = tableClaims.length;
  const billAccuracy = 75; // This would be calculated from actual data

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-6 bg-white rounded-lg shadow-sm p-6">
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
          <div className="bg-[#FDEDED] rounded-lg  p-6 flex items-center gap-4">
            <CircularProgress percentage={billAccuracy} 
            pathColor="#DC2626"
            textColor="#DC2626"
            bgColor="#FFFFFF"
            />
            <div>
              <p className="text-3xl font-bold text-gray-900">{billAccuracy}%</p>
              <p className="text-sm text-gray-500">Bill Accuracy</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Search and Actions */}
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                placeholder="Search claim description..."
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
                className="flex-1 max-w-md px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
              />
              <button
                onClick={() => loadClaims()}
                className="flex w-50 items-center justify-center gap-2 min-w-[120px] px-6 py-2.5 bg-[#DC2626] text-white rounded-sm hover:bg-red-700 transition-colors font-medium"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              <button
                onClick={() => {/* Filter functionality */}}
                className="flex w-50 items-center justify-center gap-2 min-w-[100px] px-4 py-2.5 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors font-medium"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
            <button
              onClick={() => exportTableToPDF(tableClaims)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors font-medium"
            >
              <Upload className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Provider/SSHIA ID Input Section */}
          {(!providerId || !sshiaId) && (
            <div className="px-6 pb-6 border-b">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">
                  Enter Provider and SSHIA IDs
                </h3>
                <form onSubmit={handleSubmitIds} className="flex flex-wrap gap-4 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Provider ID</label>
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
                  These IDs are required to fetch emergency claims from the API.
                </p>
              </div>
            </div>
          )}

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
                description={error ? "Failed to load claims" : "No claims found for the provided IDs."}
                action={
                  <Button onClick={routeToEmergencyBillPage}>
                    + Create New Emergency Claim
                  </Button>
                }
              />
            ) : (
              <>
                {/* Table */}
                <div className="flex-1">
                  <Table className="min-w-[1200px]">
                    <TableHeader className="bg-[#E9F7F3]">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="text-gray-700 font-medium">
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
                            className="cursor-pointer hover:bg-[#FFFFFF] transition-colors border-b border-gray-100"
                            onClick={() => handleClaimClick(row.original.id)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="py-4">
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
                              <span className="text-gray-500">
                                Try adjusting your search criteria
                              </span>
                              <Button onClick={routeToEmergencyBillPage}>
                                + Create new claim
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-500">
                  {/* <span>
                    Showing all {table.getFilteredRowModel().rows.length} settlements
                  </span> */}
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
    </>
  );
};