import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './UploadFile.css'

const UploadFile = () => {
  const [fileData, setFileData] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const processExcelFile = async () => {
    if (!selectedFile) {
      alert("Please select an Excel file to upload.");
      return;
    }
  
    try {
      const fileReader = new FileReader();
  
      fileReader.onload = async (event) => {
        const arrayBuffer = event.target.result;
  
        // Read Excel file using ArrayBuffer
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
  
        const allSheetsData = [];
        const sheetNames = workbook.SheetNames;
  
        // Process sheets starting from the 2nd sheet
        for (let i = 1; i < sheetNames.length; i++) {
          const sheetName = sheetNames[i];
          const sheet = workbook.Sheets[sheetName];
  
          // Convert sheet data to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            header: "A", // Keep header rows for customization
            defval: "",  // Fill empty cells with empty strings
          });
  
          // Map JSON to the structure needed by your backend
          const formattedData = jsonData.map((row) => ({
            L1: row["A"] || "00",
            L2: row["B"] || "00",
            L3: row["C"] || "00",
            F1: row["D"] || "00",
            F2: row["E"] || "00",
            Product: row["F"] || "",
            Description: row["G"] || "",
            Geo: row["H"] || "",
            Conditions: row["I"] || "",
          }));
  
          allSheetsData.push(...formattedData);
        }
  
        // Send processed data to backend
        await uploadToBackend(allSheetsData);
      };
  
      fileReader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("An error occurred while processing the file.");
    }
  };
  

  const uploadToBackend = async (data) => {
    try {
      setUploadStatus("Uploading data to the server...");

      // const response = await axios.post("http://localhost:5000/api/upload-functional-items", {
      //   data,
      // });
      const response = await fetch(`${API_URL}/upload-functional-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data}),
      });

      setUploadStatus("Upload successful: " + response.data.message);
    } catch (error) {
      console.error("Error uploading data:", error);
      setUploadStatus("Upload failed: " + error.response?.data?.error || error.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const l1Data = XLSX.utils.sheet_to_json(sheet, {
        header: ["L1_Code", "L1_Description"],
        range: "B6:C100",
      });

      const l2Data = XLSX.utils.sheet_to_json(sheet, {
        header: ["L2_Code", "L2_Description"],
        range: "E5:F100",
      });

      const l3Data = XLSX.utils.sheet_to_json(sheet, {
        header: ["L3_Code", "L3_Description"],
        range: "H5:I100",
      });

      const formattedData = {
        L1: l1Data.filter((row) => row.L1_Code && row.L1_Description),
        L2: l2Data.filter((row) => row.L2_Code && row.L2_Description),
        L3: l3Data.filter((row) => row.L3_Code && row.L3_Description),
      };

      setFileData(formattedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmitModule = async () => {
    if (fileData) {
      setIsUploading(true);
      setUploadStatus("");
      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: fileData }),
        });

        const result = await response.json();
        setUploadStatus(`Upload successful: ${result.message}`);
      } catch (error) {
        setUploadStatus(`Error: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };
  return (
    <div className="container">
    <h2>Upload Module Data</h2>

    <div className="file-input-wrapper">
      <label htmlFor="moduleFile">Choose File for Modules</label>
      <input id="moduleFile" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button className="file-btn" onClick={() => document.getElementById("moduleFile").click()}>
        Browse Files
      </button>
    </div>

    <button className="action-btn" onClick={handleSubmitModule} disabled={isUploading}>
      {isUploading ? "Uploading..." : "Upload Modules"}
    </button>

    {uploadStatus && (
      <div className={`status-message ${uploadStatus.startsWith("Error") ? "error" : ""}`}>
        {uploadStatus}
      </div>
    )}
  </div>
  );
};

export default UploadFile;
