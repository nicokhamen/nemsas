import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, Eye, Share } from "lucide-react";
import type { RootState } from "../../../services/store/store";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import FormHeader from "../../../components/form/FormHeader";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useAppSelector, useAppDispatch } from "../../../hooks/redux";
import { fetchEmergencyBills } from "../../../services/thunks/emergencyBillsThunk";
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
import type { EmergencyBill } from "../../../types/emergency-bills";
import { patientNameFilter } from "../../../components/ui/patientNameFilter";
import Input from "../../../components/form/Input";
// import DatePicker from "../../components/form/DatePicker";
// Files export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../../utils/pdfFont";

// Status color map for emergency bills
const statusColor: Record<string, string> = {
  Pending: "#ff9800",
  Processed: "#1976d2",
  Rejected: "#d32f2f",
  Resolved: "#2e7d32",
  Approved: "#217346",
  Paid: "#6b6f80",
  Submitted: "#9c27b0",
  Draft: "#757575",
};

// Custom filter function for searching across multiple fields
const multiFieldFilter = (row: any, _columnId: string, filterValue: string) => {
  if (!filterValue) return true;

  const searchTerm = filterValue.toLowerCase();
  const patientName = (row.getValue("patientName") || "").toLowerCase();
  const patientNumber = (row.getValue("patientNumber") || "").toLowerCase();

  return patientName.includes(searchTerm) || patientNumber.includes(searchTerm);
};
// Helper to get status text
const getEmergencyBillStatus = (status: string | undefined): string => {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// file export
const exportTableToPDF = (
  tableData: any[],
  fileName = "emergencybills.pdf",
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // set unicode font
  doc.setFont("Roboto", "normal");

  doc.setFontSize(16);
  doc.text("Emergency Bills Report", 14, 12);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 18);

  // Safely process rows with null checks
  const rows = tableData.map((claim, i) => {
    // Helper function to safely format amount
    const formatAmount = (amount: string | undefined) => {
      if (!amount) return "NGN 0.00";
      // Remove ₦ symbol and add NGN
      return amount.replace("₦", "NGN ");
    };

    return [
      i + 1,
      claim.patientName || "N/A",
      claim.patientNumber || "N/A",
      claim.lastEncounter || "N/A",
      formatAmount(claim.formattedAmount),
      formatAmount(claim.formattedVettedAmount),
      claim.insuranceStatus || "N/A",
      claim.status || "N/A",
    ];
  });

  autoTable(doc, {
    startY: 24,
    head: [
      [
        "S/N",
        "Patient Name",
        "Patient No.",
        "Last Encounter",
        "Total Amount",
        "Vetted Amount",
        "Insurance Status",
        "Bill Status",
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
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35, halign: "right" },
      5: { cellWidth: 35, halign: "right" },
      6: { cellWidth: 35 },
      7: { cellWidth: 30 },
    },

    theme: "grid",
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: 255,
    },

    // Format amount columns with proper styling
    didParseCell: function (data: any) {
      if (
        data.section === "body" &&
        (data.column.index === 4 || data.column.index === 5)
      ) {
        const cellData = data.cell.raw;
        if (
          typeof cellData === "string" &&
          cellData &&
          !cellData.includes("NGN")
        ) {
          // Add NGN symbol and format with commas if it's a number
          const numValue = parseFloat(cellData);
          if (!isNaN(numValue)) {
            data.cell.text = ["NGN " + numValue.toLocaleString()];
          }
        }
      }
    },
  });

  doc.save(fileName);
};

// Format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "0.00";
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
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

export const EmergencyBills = () => {
  // Filter states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_startDate, setStartDate] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_endDate, setEndDate] = useState<string>("");
  // const [billStatus, setBillStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get emergency bills state from Redux
  const {
    bills: reduxEmergencyBills,
    loading,
    error,
  } = useAppSelector((state) => state.emergencyBills);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user data from Redux auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { selectedProviderId } = useProviderContext();

  // Route to emergency bill creation page
  const routeToEmergencyBillPage = () => {
    navigate("/emergency/bill-capture");
  };

  // Load emergency bills
  const loadEmergencyBills = useCallback(() => {
    // Use selectedProviderId from context or fallback to currentUser's providerId
    const providerIdToUse = selectedProviderId || currentUser?.providerId;

    if (!providerIdToUse) {
      console.error("No providerId available");
      return;
    }

    dispatch(fetchEmergencyBills({ providerId: providerIdToUse }));
  }, [dispatch, selectedProviderId, currentUser?.providerId]);

  // Load bills when component mounts AND when providerId is available
  useEffect(() => {
    loadEmergencyBills();
  }, [loadEmergencyBills]);

  // Clear errors on unmount
  // useEffect(() => {
  //   return () => {
  //     dispatch(clearError());
  //   };
  // }, [dispatch]);

  // Map emergency bills to table format
  const tableBills = useMemo(() => {
    return (reduxEmergencyBills || []).map((bill: EmergencyBill, index) => {
      // Calculate total amount from productServices array
      const totalAmount = Array.isArray(bill.productServices)
        ? bill.productServices.reduce((sum: number, item: any) => {
            const unitPrice = item?.unitPrice || item?.price || 0;
            const quantity = item?.quantity || 1;
            return sum + unitPrice * quantity;
          }, 0)
        : 0;

      // Get patient information from the patient object
      const patient = bill.patient || {};
      const firstName = patient.firstName ?? "";
      const lastName = patient.lastName ?? "";

      const patientName = `${firstName} ${lastName}`.trim() || "N/A";
      const patientNumber = patient.hospitalNumber || "N/A";

      // Calculate age from date of birth
      const calculateAgeFromDOB = (dob: string | undefined): string => {
        if (!dob) return "N/A";
        try {
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          return age.toString();
        } catch {
          return "N/A";
        }
      };

      const age =
        patient.age || calculateAgeFromDOB(patient.dateOfBirth) || "N/A";
      const sex = patient.gender || "N/A";

      // Get the last encounter date
      const lastEncounter =
        bill.encounterStartDateTime || bill.createdDate || "N/A";

      // Determine insurance status from patient
      const insuranceStatus =
        patient.insuranceStatus ||
        (patient.insuranceStatus ? "Active" : "Unknown");

      return {
        id: bill.id || `bill-${index}`,
        sn: index + 1,
        patientName,
        patientNumber,
        age,
        sex,
        lastEncounter: formatDate(lastEncounter),
        totalAmount: totalAmount,
        formattedAmount: `₦${formatCurrency(totalAmount)}`,
        insuranceStatus,
        status: getEmergencyBillStatus(bill.dischargeStatus || "draft"),
        rawBill: bill,
      };
    });
  }, [reduxEmergencyBills]);

  // Define columns based on required fields
  const columns: ColumnDef<(typeof tableBills)[0]>[] = [
    {
      accessorKey: "sn",
      header: "S/N",
      size: 60,
    },
    {
      accessorKey: "patientName",
      header: "Patient Name",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "patientNumber",
      header: "Patient Number",
      enableSorting: true,
      filterFn: multiFieldFilter,
    },
    {
      accessorKey: "age",
      header: "Age",
      enableSorting: true,
    },
    {
      accessorKey: "sex",
      header: "Sex",
      enableSorting: true,
    },
    {
      accessorKey: "lastEncounter",
      header: "Last Encounter",
      enableSorting: true,
    },
    {
      accessorKey: "formattedAmount",
      header: "Total Amount",
      enableSorting: true,
    },
    {
      accessorKey: "insuranceStatus",
      header: "Insurance Status",
      cell: ({ row }) => (
        <span
          style={{
            color:
              row.original.insuranceStatus === "Active"
                ? "#2e7d32"
                : row.original.insuranceStatus === "Inactive"
                  ? "#d32f2f"
                  : "#757575",
            fontWeight: 500,
          }}
        >
          {row.original.insuranceStatus}
        </span>
      ),
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
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/emergency/bills/${row.original.id}`);
          }}
          title="View Bill"
        >
          <Eye className="h-5 w-5" />
        </button>
      ),
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

  // Show loading while waiting for user data
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser?.providerId && !selectedProviderId) {
    return (
      <div className="p-6 text-center">
        No provider found. Please select a provider or contact support.
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="bg-gray-100 overflow-scroll h-full">
          <div className="bg-white rounded-md flex flex-col mb-36">
            {/* Filters */}
            {/* <div className="px-6 py-4 border-b bg-gray-50"> */}
            <div className="flex flex-wrap gap-4 justify-between items-center p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Filter By
              </h3>
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name or Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name or Number"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      table.getColumn("patientName")?.setFilterValue(value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
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
                <div className="col-span-3 flex gap-3">
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSearchTerm("");
                      table.setColumnFilters([]);
                      loadEmergencyBills();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      // Apply filters
                      loadEmergencyBills();
                    }}
                    className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-sm hover:bg-red-700 transition-colors font-medium"
                  >
                    Apply filter
                  </button>
                </div>
              </div>
            </div>
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center py-6 px-0 bg-gray-50">
              <div className="flex items-center gap-8">
                <label className="block text-lg  text-gray-700 mb-2">
                  Emergency Bill Capture List
                </label>
              </div>
              <div className="flex gap-4 items-center">
                <button
                  onClick={routeToEmergencyBillPage}
                  className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-sm hover:bg-red-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Create New Bill
                </button>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => exportTableToPDF(tableBills)}
                    className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition"
                  >
                    <Share className="h-4 w-4" />
                    Export
                  </button>
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
                  <Button onClick={loadEmergencyBills} className="mt-4">
                    Retry Loading Bills
                  </Button>
                </div>
              ) : tableBills.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">📄</span>}
                  title="No emergency bills available yet"
                  description="No emergency bills found for your provider."
                  action={
                    <Button onClick={routeToEmergencyBillPage}>
                      + Create a new Emergency Bill
                    </Button>
                  }
                />
              ) : (
                <>
                  {/* Table */}
                  <div className="flex-1 lg:px-0 lg:mt-4">
                    <Table className="min-w-[800px]">
                      <TableHeader className=" bg-[#E4F7F1] hover:bg-[#E4F7F1] transition-colors">
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
                                // Navigate to bill details
                                navigate(`/emergency/bills/${row.original.id}`);
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
                                  No bills found
                                </span>
                                <span className="font-medium">
                                  Try adjusting your search criteria
                                </span>
                                <Button onClick={routeToEmergencyBillPage}>
                                  + Create new bill
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
      </div>
    </>
  );
};
