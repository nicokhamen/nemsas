
import { FileUpload } from "../../../../components/FileUpload";

interface FileUploadSectionProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploadSection({
  onFilesSelected,
}: FileUploadSectionProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Upload Supporting Documents
      </h2>
      <FileUpload onFilesSelected={onFilesSelected} />
    </div>
  );
}