import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Eye } from "lucide-react";
import type { RootState } from "../../services/store/store";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { useAppDispatch } from "../../hooks/redux";
import { useProviderContext } from "../../context/useProviderContext";
import { fetchEmergencyBillPatients } from "../../services/thunks/emergencyBillPatientsThunk";
import { clearEmergencyBillPatients } from "../../services/slices/emergencyBillPatientsSlice";
import type { EmergencyBillPatient } from "../../types/emergency-bill-patients";

const ZERO_GUID = "00000000-0000-0000-0000-000000000000";

const formatCurrency = (amount: number): string => {
  return `\u20a6${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString || dateString.startsWith("0001-01-01")) return "N/A";

  return new Date(dateString).toLocaleDateString("en-NG", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

const getFullName = (patient: EmergencyBillPatient): string => {
  return `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "N/A";
};

export const MdReviewPatients = () => {
  const { id: claimId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { selectedProviderId } = useProviderContext();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const providerIdFromLocation = location.state?.providerId;
  const descriptionFromLocation = location.state?.description;
  const queryClaimNumber = new URLSearchParams(location.search).get(
    "ClaimNumber",
  );
  const claimNumber = location.state?.claimNumber || queryClaimNumber || "";

  const providerId = useMemo(() => {
    if (currentUser?.providerId && currentUser.providerId !== ZERO_GUID) {
      return currentUser.providerId;
    }

    if (providerIdFromLocation && providerIdFromLocation !== ZERO_GUID) {
      return providerIdFromLocation;
    }

    if (selectedProviderId && selectedProviderId !== ZERO_GUID) {
      return selectedProviderId;
    }

    return "";
  }, [currentUser, providerIdFromLocation, selectedProviderId]);

  const {
    data: emergencyBillPatients,
    loading,
    error,
  } = useSelector((state: RootState) => state.emergencyBillPatients);

  const patients = emergencyBillPatients?.data || [];

  const loadPatients = useCallback(() => {
    if (claimId && providerId) {
      dispatch(
        fetchEmergencyBillPatients({
          emergencyClaimId: claimId,
          providerId,
        }),
      );
    }
  }, [dispatch, claimId, providerId]);

  useEffect(() => {
    loadPatients();

    return () => {
      dispatch(clearEmergencyBillPatients());
    };
  }, [dispatch, loadPatients]);

  const handleBack = () => {
    navigate("/md-review");
  };

  const handlePatientClick = (patient: EmergencyBillPatient) => {
    navigate(
      `/md-review/emergency-bills/${claimId}/${patient.id}?ClaimNumber=${encodeURIComponent(
        claimNumber,
      )}`,
      {
        state: {
          patientId: patient.id,
          hospitalNumber: patient.hospitalNumber,
          patientName: getFullName(patient),
          description: descriptionFromLocation,
          claimId,
          claimNumber,
          providerId,
          fromMdReview: true,
        },
      },
    );
  };

  if (!currentUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white px-5 py-5 shadow-sm">
          <div className="border-b border-gray-300 pb-5">
            <div className="flex items-start justify-between gap-4">
              {/* LEFT SIDE */}
              <div>
                <div className="flex flex-wrap items-center gap-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {claimNumber || "N/A"}
                  </h2>
                  <span className="rounded-full bg-orange-50 px-5 py-1 text-sm font-medium text-orange-500">
                    {patients.length} Bills Awaiting Review
                  </span>
                </div>

                <p className="mt-2 text-gray-800">
                  {descriptionFromLocation || "N/A"}
                </p>
              </div>

              {/* RIGHT SIDE */}
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                ← Back
              </Button>
            </div>
          </div>

          <h3 className="border-b border-gray-300 px-3 py-4 text-lg font-semibold text-red-600">
            Patients
          </h3>

          {error && (
            <div className="my-6 border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={loadPatients}
                  className="rounded-sm text-red-600 hover:text-red-700"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {loading && !emergencyBillPatients ? (
            <div className="flex h-52 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : !providerId ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-500">
                Provider ID is required to view patients.
              </p>
              <Button onClick={handleBack} className="rounded-sm">
                Back to Reviews
              </Button>
            </div>
          ) : !claimId ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-500">
                Claim ID is missing. Please go back and select a review.
              </p>
              <Button onClick={handleBack} className="rounded-sm">
                Back to Reviews
              </Button>
            </div>
          ) : patients.length === 0 ? (
            <EmptyState
              icon={<span className="text-2xl">PDF</span>}
              title="No patients available"
              description={
                error
                  ? "Failed to load patients"
                  : "No patients found for this review."
              }
            />
          ) : (
            <div className="overflow-x-auto pt-6">
              <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
                <thead className="bg-[#F1FAF7] text-gray-500">
                  <tr>
                    {/* <th className="w-8 px-2 py-4 font-semibold"></th> */}
                    <th className="px-4 py-4 font-semibold">Hospital Number</th>
                    <th className="px-4 py-4 font-semibold">First Name</th>
                    <th className="px-4 py-4 font-semibold">Last Name</th>
                    <th className="px-4 py-4 font-semibold">
                      Insurance Status
                    </th>
                    {/* <th className="px-4 py-4 font-semibold">DOB</th> */}
                    <th className="px-4 py-4 font-semibold">Gender</th>
                    {/* <th className="px-4 py-4 font-semibold">Address</th> */}
                    {/* <th className="px-4 py-4 font-semibold">Email</th> */}
                    <th className="px-4 py-4 font-semibold">Phone Number</th>
                    <th className="px-4 py-4 font-semibold">Total Amount</th>
                    <th className="w-10 px-4 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="cursor-pointer border-b border-gray-100 text-gray-600 transition hover:bg-gray-50"
                      onClick={() => handlePatientClick(patient)}
                    >
                      {/* <td className="px-2 py-4">
                        <input
                          type="checkbox"
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4"
                        />
                      </td> */}
                      <td className="px-4 py-4">
                        {patient.hospitalNumber || "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        {patient.firstName || "N/A"}
                      </td>
                      <td className="px-4 py-4">{patient.lastName || "N/A"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            patient.insuranceStatus === "NHIA"
                              ? "text-green-600"
                              : "text-orange-500"
                          }
                        >
                          {patient.insuranceStatus || "N/A"}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4">
                        {formatDate(patient.dateOfBirth)}
                      </td> */}
                      <td className="px-4 py-4">{patient.gender || "N/A"}</td>
                      {/* <td
                        className="max-w-[120px] truncate px-4 py-4"
                        title={patient.address || "N/A"}
                      >
                        {patient.address || "N/A"}
                      </td>
                      <td
                        className="max-w-[120px] truncate px-4 py-4"
                        title={patient.email || "N/A"}
                      >
                        {patient.email || "N/A"}
                      </td> */}
                      <td className="px-4 py-4">
                        {patient.phoneNumber || "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        {formatCurrency(patient.totalAmount || 0)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePatientClick(patient);
                          }}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          title="View patient bills"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MdReviewPatients;
