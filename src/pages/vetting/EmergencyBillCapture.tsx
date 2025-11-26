import FormHeader from "../../components/form/FormHeader"

export default function EmergencyBillCapture() {
  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 p-4 flex justify-center">
        <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl p-6 space-y-6">
          {/* Encounter Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow">
              <span className="font-semibold">EncounterId 0001</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                View
              </button>
            </div>

            <div className="flex gap-4">
                <h2>Comment</h2>
              <textarea
                placeholder="Comment:"
                className="flex-1 border border-gray-300 rounded-lg p-3"
              />

              <div className="flex-1 flex items-center justify-center space-x-3">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                  Dispute
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  Approve
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                  Reject
                </button>
              </div>
            </div>
          </div>

          {/* Ward & Clinic */}
          <div className="border rounded-xl p-6 space-y-6">
            <FormHeader>Ward/Clinic</FormHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Enter Name"
                className="border p-3 rounded-lg w-full"
              />

              <select className="border p-3 rounded-lg w-full">
                <option>Select service type</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="date"
                placeholder="Encounter Start Date/Time"
                className="border p-3 rounded-lg w-full"
              />

              <select className="border p-3 rounded-lg w-full">
                <option>Transferred / Discharged</option>
              </select>

              <input
                type="date"
                placeholder="Discharge Date"
                className="border p-3 rounded-lg w-full"
              />
            </div>

            {/* Medical History */}
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" /> <span>Road traffic accidents</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" />{" "}
                <span>Obstetric & gynaecological emergencies</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" />{" "}
                <span>Drug & poisoning emergencies</span>
              </label>
            </div>

            {/* Diagnosis Table */}
            <div>
              <h3 className="font-semibold mb-3">Diagnosis</h3>
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Type</th>
                      <th className="p-2 border">Code</th>
                      <th className="p-2 border">Diagnosis</th>
                      <th className="p-2 border">Note</th>
                      <th className="p-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">ICD 10</td>
                      <td className="p-2 border">B54.2</td>
                      <td className="p-2 border">Type 2 diabetes mellitus</td>
                      <td className="p-2 border italic text-gray-500">
                        They can add a little note...
                      </td>
                      <td className="p-2 border text-center">
                        <button className="px-3 py-1 bg-red-500 text-white rounded">
                          Remove
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border">ICD 11</td>
                      <td className="p-2 border">AA022</td>
                      <td className="p-2 border">
                        Typhoid fever with meningitis
                      </td>
                      <td className="p-2 border"></td>
                      <td className="p-2 border text-center">
                        <button className="px-3 py-1 bg-red-500 text-white rounded">
                          Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Uploaded Files */}
            <div>
              <h3 className="font-semibold mb-3">Uploaded files</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                  145816452.jpg
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                  146816452.jpg
                </div>
              </div>
            </div>
          </div>

          {/* Physician */}
          <div className="space-y-4">
            <input
              placeholder="Attending Physician"
              className="border p-3 rounded-lg w-full"
            />

            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                Dispute
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Reject
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border"></th>
                  <th className="p-2 border">PRODUCT/SERVICE</th>
                  <th className="p-2 border">QTY</th>
                  <th className="p-2 border">PRICE</th>
                  <th className="p-2 border">NHIS(%)</th>
                  <th className="p-2 border">NHIS(N)</th>
                  <th className="p-2 border">NET AMOUNT</th>
                  <th className="p-2 border">Flags</th>
                  <th className="p-2 border">Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border"></td>
                  <td className="p-2 border">Fasting lipid profile</td>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">3,150.00</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">3,150.00</td>
                  <td className="p-2 border text-orange-600">Not Covered</td>
                  <td className="p-2 border">Not Justified</td>
                </tr>
                <tr>
                  <td className="p-2 border"></td>
                  <td className="p-2 border">Full Blood Count</td>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">1,500.00</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">1,500.00</td>
                  <td className="p-2 border text-orange-600">Not Covered</td>
                  <td className="p-2 border">Mismatch Diagnosis</td>
                </tr>
                <tr>
                  <td className="p-2 border"></td>
                  <td className="p-2 border">PCV Child</td>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">100.00</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">100.00</td>
                  <td className="p-2 border text-orange-600">Not Covered</td>
                  <td className="p-2 border">Not Covered</td>
                </tr>
                <tr>
                  <td className="p-2 border"></td>
                  <td className="p-2 border">Haemoglobin</td>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">500.00</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">0</td>
                  <td className="p-2 border">500.00</td>
                  <td className="p-2 border text-red-600">
                    Deny Timely Filling
                  </td>
                  <td className="p-2 border">Beyond 48 Hours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right text-xl font-bold">
            Total Amount: ₦60,500
          </div>
        </div>
      </div>
    </>
  );
}
