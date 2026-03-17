import React, { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Input from "../../../components/form/Input";

interface FileItem {
  name: string;
}

const RegisterProvider: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    { name: "12933_15062025.jpg" },
    { name: "12936_15062025.jpg" },
    { name: "12934_15062025.jpg" },
    { name: "12937_15062025.jpg" },
    { name: "12935_15062025.jpg" },
    { name: "12938_15062025.jpg" },
  ]);

  const removeFile = (name: string) => {
    setFiles(files.filter((file) => file.name !== name));
  };

  return (
    <>
    
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">

        {/* Title */}
        <h2 className="text-red-500 font-semibold mb-6">
          Provider Information
        </h2>

        {/* Form Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <Input
            type="text"
            placeholder="Hospital Name"
            className="input"
          />

          <Input
            type="email"
            placeholder="Email"
            className="input"
          />

          <Input
            type="text"
            placeholder="Location"
            className="input"
          />

          {/* Phone */}
          <div className="flex">
            <span className="px-3 flex items-center bg-gray-100 border border-r-0 rounded-l-md text-sm text-gray-500">
              +234
            </span>

            <input
              type="text"
              placeholder="1 234 55 67"
              className="input rounded-l-none"
            />
          </div>

          <select className="input">
            <option>Provider Type</option>
            <option>Hospital</option>
            <option>Clinic</option>
          </select>

          <Input
            type="text"
            placeholder="Email"
            className="input"
          />

          <Input
            type="text"
            placeholder="NHIA Provider Code"
            className="input"
          />

          <select className="input">
            <option>Ownership (Public / Private)</option>
            <option>Public</option>
            <option>Private</option>
          </select>

          <Input
            type="text"
            placeholder="License Number"
            className="input"
          />
        </div>

        {/* Supporting Documents */}
        <h3 className="text-red-500 font-semibold mb-4">
          Supporting Documents
        </h3>

        <div className="grid grid-cols-2 gap-8">

          {/* Upload Area */}
          <div className="border-2 border-dashed rounded-lg p-10 text-center flex flex-col items-center justify-center text-gray-500">
            <UploadCloud size={40} className="mb-4" />

            <p className="text-sm">
              Drag and drop to upload a passport photo
            </p>

            <p className="text-sm">
              or{" "}
              <span className="text-red-500 cursor-pointer">
                browse
              </span>{" "}
              to select a PNG file
            </p>
          </div>

          {/* Uploaded Files */}
          <div>
            <h4 className="font-medium mb-4">
              Uploaded Documents
            </h4>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between text-sm border-b pb-2"
                >
                  <span className="text-gray-600">
                    {file.name}
                  </span>

                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700">
            Submit
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default RegisterProvider;