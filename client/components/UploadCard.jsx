import { useState } from 'react';

export default function UploadCard({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    onUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    onUpload(files);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        id="file-upload"
        accept=".pdf,.doc,.docx"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            Drag and drop your files here, or{' '}
            <span className="text-blue-500">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>
      </label>
    </div>
  );
} 