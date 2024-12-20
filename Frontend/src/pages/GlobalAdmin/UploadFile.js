import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./UploadFile.css";

const UploadFile = () => {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModuleFile, setSelectedModuleFile] = useState(null);
  const [selectedFunctionalFile, setSelectedFunctionalFile] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Helper to process Excel files
  const processExcelFile = (file, sheetRangeMapping) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const processedData = {};
          for (const [key, range] of Object.entries(sheetRangeMapping)) {
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
              header: key.includes("title") ? ["title"] : ["Code", "Description"],
              range,
            });
            processedData[key] = jsonData.filter(
              (row) => row.Code && row.Description
            );
          }
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // Upload to Backend
  const uploadToBackend = async (endpoint, data) => {
    try {
      setUploadStatus("Uploading data to the server...");
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setUploadStatus(`Upload successful: ${result.message}`);
    } catch (error) {
      console.error("Error uploading data:", error);
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  // Handle File Selection
  const handleFileSelection = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  // Handle Module Upload
  const handleModuleUpload = async () => {
    if (!selectedModuleFile) {
      alert("Please select a Module file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      const moduleData = await processExcelFile(selectedModuleFile, {
        title: "C5",
        L1: "B6:C100",
        L2: "E5:F100",
        L3: "H5:I100",
      });

      await uploadToBackend("upload-modules", moduleData);
    } catch (error) {
      console.error("Error processing module file:", error);
      setUploadStatus("Failed to process Module file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Functional Items Upload
  const handleFunctionalUpload = async () => {
    if (!selectedFunctionalFile) {
      alert("Please select a Functional Items file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      const functionalData = await processExcelFile(selectedFunctionalFile, {
        L1: "A2:A100",
        L2: "B2:B100",
        L3: "C2:C100",
        F1: "D2:D100",
        F2: "E2:E100",
      });

      await uploadToBackend("upload-functional-items", functionalData);
    } catch (error) {
      console.error("Error processing functional items file:", error);
      setUploadStatus("Failed to process Functional Items file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <h2>Upload Module and Functional Data</h2>

      {/* Module File Upload */}
      <div className="file-input-wrapper">
        <label htmlFor="moduleFile">Choose File for Modules</label>
        <input
          id="moduleFile"
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => handleFileSelection(e, setSelectedModuleFile)}
        />
        <button
          className="action-btn"
          onClick={handleModuleUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Modules"}
        </button>
      </div>

      {/* Functional Items File Upload */}
      <div className="file-input-wrapper">
        <label htmlFor="functionalFile">Choose File for Functional Items</label>
        <input
          id="functionalFile"
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => handleFileSelection(e, setSelectedFunctionalFile)}
        />
        <button
          className="action-btn"
          onClick={handleFunctionalUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Functional Items"}
        </button>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className={`status-message ${uploadStatus.startsWith("Error") ? "error" : ""}`}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadFile;
