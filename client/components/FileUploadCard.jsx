import { useRef, useState } from 'react';

export default function FileUploadCard({ onUpload }) {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files) => {
    setSelectedFiles(Array.from(files));
  };

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
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files)}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      
      <div className="mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="text-blue-500 hover:text-blue-700"
        >
          Choose files
        </button>
        <span className="text-gray-500 ml-2">or drag and drop files here</span>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Selected Files:</h4>
            <ul className="text-left">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-gray-600">{file.name}</li>
              ))}
            </ul>
          </div>
          
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Upload Files
          </button>
        </div>
      )}
    </div>
  );
} 