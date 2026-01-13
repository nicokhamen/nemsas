import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/store/store";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import FormHeader from "../../components/form/FormHeader";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { fetchEmergencyBills } from "../../services/thunks/emergencyBillsThunk";
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
import type { EmergencyBill } from "../../types/emergency-bills";
import { patientNameFilter } from "../../components/ui/patientNameFilter";
import Input from "../../components/form/Input";
// import DatePicker from "../../components/form/DatePicker";

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

// Helper to get status text
const getEmergencyBillStatus = (status: string | undefined): string => {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
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
      filterFn: patientNameFilter,
    },
    {
      accessorKey: "patientNumber",
      header: "Patient Number",
      enableSorting: true,
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
      enableHiding: false,
      cell: ({ row }) => (
        <button
          className="h-auto py-1 px-3 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/emergency/bills/${row.original.id}`);
          }}
        >
          View
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
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center p-6">
              <div className="flex items-center gap-8">
                <FormHeader>Emergency Bill Capture List</FormHeader>

              </div>
              <div className="flex gap-4 items-center">
                <Button
                  onClick={routeToEmergencyBillPage}
                  variant="outline"
                  title="Create an Emergency Bill"
                >
                  + 
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 pb-4 border-b">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <Input
                    label="search with patient name"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      table.getColumn("patientName")?.setFilterValue(value);
                    }}
                  />
                </div>
                {/* <div>
                  <DatePicker label="Start date"></DatePicker>
                </div>
                <div>
                  <DatePicker label="End date"></DatePicker>
                </div> */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSearchTerm("");
                      table.setColumnFilters([]);
                      loadEmergencyBills();
                    }}
                  >
                    Reset
                  </Button>
                  {/* <Button>Apply Filters</Button> */}
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
                                // Navigate to bill details
                                navigate(`/emergency/bills/${row.original.id}`);
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
