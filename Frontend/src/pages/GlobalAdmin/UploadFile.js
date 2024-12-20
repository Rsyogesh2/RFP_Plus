import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./UploadFile.css";

const UploadFile = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  const handleFileUpload = (file) => {
    if (!file || !file.name.match(/\.(xls|xlsx)$/)) {
      alert("Only Excel files are allowed!");
      return;
    }

    const newFile = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      progress: 0,
      status: "Pending",
    };
    setUploadedFiles((prev) => [...prev, newFile]);
    processFile(file, newFile);
  };

  const processFile = (file, fileEntry) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // Simulate file upload progress
        const interval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.name === fileEntry.name
                ? { ...f, progress: Math.min(f.progress + 10, 100), status: f.progress >= 90 ? "Completed" : "Uploading" }
                : f
            )
          );

          if (fileEntry.progress >= 100) clearInterval(interval);
        }, 300);
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === fileEntry.name
              ? { ...f, progress: 0, status: "Error" }
              : f
          )
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const removeFile = (fileName) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  return (
    <div className="upload-container">
      <h2>Upload Files</h2>
      <div
        className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag & Drop files here OR</p>
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <button onClick={() => document.getElementById("fileInput").click()}>
          Browse Files
        </button>
      </div>

      <div className="uploaded-files">
        <h3>Uploaded Files</h3>
        {uploadedFiles.map((file) => (
          <div key={file.name} className="file-entry">
            <div className="file-info">
              <span>{file.name}</span>
              <span>{file.size}</span>
            </div>
            <div className="file-progress">
              <div
                className={`progress-bar ${file.status === "Error" ? "error" : ""}`}
                style={{ width: `${file.progress}%` }}
              ></div>
              <span className="status">{file.status}</span>
            </div>
            <button
              className="remove-btn"
              onClick={() => removeFile(file.name)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadFile;
