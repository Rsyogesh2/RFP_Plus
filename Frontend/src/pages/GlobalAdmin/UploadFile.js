import React, { useState } from 'react';
import * as XLSX from 'xlsx';

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
      await fetch(`${API_URL}/upload-functional-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data:fileData}),
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
      const workbook = XLSX.read(data, { type: 'array' });
  
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const l1titleGroup = XLSX.utils.sheet_to_json(sheet, {
        header: ['title'],
        range: 'C5', // Adjust range if needed
      });
      console.log(l1titleGroup)

      // Parse L1 data (B6, C6 onward)
      const l1Data = XLSX.utils.sheet_to_json(sheet, {
        header: ['L1_Code', 'L1_Description'],
        range: 'B6:C100', // Adjust range if needed
      });
  
      // Parse L2 data (E5, F5 onward)
      const l2Data = XLSX.utils.sheet_to_json(sheet, {
        header: ['L2_Code', 'L2_Description'],
        range: 'E5:F100', // Adjust range if needed
      });
  
      // Parse L3 data (H5, I5 onward)
      const l3Data = XLSX.utils.sheet_to_json(sheet, {
        header: ['L3_Code', 'L3_Description'],
        range: 'H5:I100', // Adjust range if needed
      });
  
      // Set parsed data
      const formattedData = {
        title:l1titleGroup,
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
      try {
        await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data:fileData}),
        });
        alert('Data uploaded successfully');
      } catch (error) {
        console.error('Error uploading data:', error);
      }
    }
  };

  return (
    <div>
      <h2>Upload Module Data</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={handleSubmitModule}>Upload Modules</button>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={processExcelFile}>Upload Functional Items</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default UploadFile;
