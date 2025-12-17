import ButtonG from "../../components/form/ButtonG";
import ButtonT from "../../components/form/ButttonT";
import FormHeader from "../../components/form/FormHeader";

export default function EndorsementReview() {
  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 p-6 flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">FCT/ETC/002</h1>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              Awaiting Review
            </span>
          </div>

          {/* Patient Details */}
          <section>
            <FormHeader className="py-4 ">Patient Details</FormHeader>
            <hr className="py-4 " />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Patient Number" value="PT100" />
              <Info label="Gender" value="Male" />
              <Info label="Phone number" value="+23456789009" />
              <Info label="Insurance" value="NHS" />
              <Info label="Hospital Name" value="GOPD" />
              <Info label="Email" value="thelma.george@gmail.com" />
              <Info label="Address" value="67, Admiralty way, Lagos Island" />
              <Info label="Age" value="29" />
            </div>
          </section>

          {/* Encounter Details */}
          <section>
            <FormHeader className="py-4 ">Encounter Details & Diagnosis</FormHeader>
            <hr className="py-4 " />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Encounter ID" value="ENID-20912" />
              <Info label="Emergency Type" value="Collapse" />
              <Info label="Encounter Date" value="12/12/2025" />
              <Info label="Ward/Unit" value="NHS" />
              <Info label="Diagnosis" value="Type 2 Diabetes mellitus" />
              <Info label="Type" value="ICD10" />
              <Info label="Code" value="B542" />
              <Info label="Note" value="No comment..." />
            </div>
          </section>

          {/* Uploaded Documents */}
          <section>
            <FormHeader className="py-4 ">Uploaded Documents</FormHeader>
            <hr className="py-4 " />
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-600">
              {[
                "12931_15062025.jpg",
                "12935_15062025.jpg",
                "12934_15062025.jpg",
                "12974_15062025.jpg",
                "12915_15062025.jpg",
                "12978_15062025.jpg",
              ].map((file, i) => (
                <span key={i} className="underline cursor-pointer">{file}</span>
              ))}
            </div>
          </section>

          {/* Services Billed */}
          <section>
            <FormHeader className="py-4 ">Services Billed</FormHeader>
            <hr className="py-4 " />
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Tariff Code</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Unit Price</th>
                  <th className="p-2 text-left">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">TRF-209192</td>
                  <td className="p-2">Surgery consultation</td>
                  <td className="p-2">1</td>
                  <td className="p-2">₦50,000</td>
                  <td className="p-2">₦50,000.00</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Signature */}
          <section>
            <FormHeader className="py-4 ">Signature</FormHeader>
            <hr className="py-4 " />
            <p className="text-sm mb-2">To approve, add your signature in the box below and your legal name</p>

            <div className="border rounded-lg h-28 mb-3" />
            <input
              type="text"
              placeholder="Type your name here"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </section>

          {/* Buttons */}
          <div className="flex gap-4">

            <ButtonG>Approve</ButtonG>
            <ButtonT>Reject</ButtonT>

          </div>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
