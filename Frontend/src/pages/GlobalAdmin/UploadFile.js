import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./UploadFile.css";

const UploadFile = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFile = {
        name: file.name,
        progress: 0,
        status: "Pending",
        errorMessage: "",
      };
      setUploadedFiles((prev) => [...prev, newFile]);
      processFile(file, newFile);
    }
  };

  const processFile = async (file, fileEntry) => {
    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, progress: i, status: "Uploading" } : f
            )
          );
          await new Promise((res) => setTimeout(res, 50));
        }

        await uploadToBackend(jsonData, file.name);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, progress: 100, status: "Completed" } : f
          )
        );
      } catch (error) {
        console.error("Error processing file:", error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, progress: 0, status: "Error", errorMessage: error.message }
              : f
          )
        );
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const uploadToBackend = async (data, fileName) => {
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) throw new Error(`Failed to upload file: ${fileName}`);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Files</h2>
      <div className="upload-area">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <button onClick={() => document.querySelector('input[type="file"]').click()}>
          Browse Files
        </button>
      </div>
      <div className="uploaded-files">
        {uploadedFiles.map((file) => (
          <div key={file.name} className="file-entry">
            <div className="file-info">
              <span>{file.name}</span>
              {file.status === "Error" && <span className="error">{file.errorMessage}</span>}
            </div>
            <div className="file-progress">
              <div
                className={`progress-bar ${file.status === "Error" ? "error" : ""}`}
                style={{ width: `${file.progress}%` }}
              ></div>
              <span className="status">{file.status}</span>
            </div>
            {file.status !== "Completed" && (
              <button
                className="cancel-btn"
                onClick={() =>
                  setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name))
                }
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadFile;
