import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Image, File, X, Check } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  maxFiles = 4,
  maxSize = 10 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleNewFiles(files);
  };

  const handleNewFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSize) {
        alert(`File "${file.name}" exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    });

    const updatedFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleNewFiles(files);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area and Files List in Same Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Upload Button/Area */}
        <div 
          onClick={triggerUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 min-w-[200px] p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-2 bg-blue-100 rounded-full mb-2">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Upload Files</span>
            <span className="text-xs text-gray-500 mt-1">
              Drag & drop or click
            </span>
          </div>
        </div>

        {/* Files List */}
        {selectedFiles.length > 0 && (
          <div className="flex-1 min-w-[300px]">
            <div className="bg-white border rounded-xl p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Selected Files ({selectedFiles.length}/{maxFiles})
                </h3>
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles([]);
                      onFilesSelected([]);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getFileIcon(file)}
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />

      {/* Info Text */}
      <div className="flex items-center text-xs text-gray-500">
        <Check className="w-3 h-3 mr-1" />
        <span>Max {maxFiles} files • Max {maxSize}MB per file • PDF, JPG, PNG, DOC, DOCX</span>
      </div>

      {/* File Type Indicators (Optional - Small Icons Row) */}
      <div className="flex items-center space-x-4 pt-2 border-t">
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3 text-red-500" />
          <span className="text-xs text-gray-500">PDF</span>
        </div>
        <div className="flex items-center space-x-1">
          <Image className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-gray-500">Images</span>
        </div>
        <div className="flex items-center space-x-1">
          <File className="w-3 h-3 text-blue-600" />
          <span className="text-xs text-gray-500">Documents</span>
        </div>
      </div>
    </div>
  );
};