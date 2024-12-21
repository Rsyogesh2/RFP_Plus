import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./UploadFile.css";

const UploadFile = () => {
  const [fileData, setFileData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  //=========
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // const handleFileSelect = (event) => {
  //   const files = Array.from(event.target.files);
  //   setSelectedFiles(files);
  // };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select a file to upload.");
      return;
    }
    // Mock upload function
    alert("Files uploaded successfully!");
    setSelectedFiles([]);
  };

  const removeFile = () => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== 0));
  };
  //=========
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const handleFileChange = (event) => {
    console.log("Event");
    console.log(event.target.files);
    console.log(event.target.files[0]);
    const file = event.target.files[0]; // Access the first file
      if (file) {
        console.log(file.name); // Log the name of the file
      }

   try{
    setSelectedFile(event.target.files[0]);
    const files = Array.from(event.target.files);
     setSelectedFiles(files);
    console.log("Event Done");
   } catch(e){
    console.log(e);
   }
   
  };
  const handleUploadModule = async(e) => {
    // handleFileSelect(e)
    // const file = e.target.files[0];
    if (!selectedFile) {
      alert("Please select an Excel file to upload.");
      return;
    }

    try {
      setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async(event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const l1title = XLSX.utils.sheet_to_json(sheet, {
        header: ["title"],
        range: "C5",
      });

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
        title: l1title,
        L1: l1Data.filter((row) => row.L1_Code && row.L1_Description),
        L2: l2Data.filter((row) => row.L2_Code && row.L2_Description),
        L3: l3Data.filter((row) => row.L3_Code && row.L3_Description),
      };

      setFileData(formattedData);
      await uploadToBackendModule();
      alert("File uploaded successfully!");
    };

    reader.readAsArrayBuffer(selectedFile);
  } catch (error) {
    console.error("Error processing file:", error);
    alert("An error occurred while processing the file.");
  } finally {
    setIsUploading(false);
  }
  };

  const handleUploadFunctional = async () => {
    if (!selectedFile) {
      alert("Please select an Excel file to upload.");
      return;
    }
  
    const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please upload an Excel file.");
      return;
    }
  
    try {
      setIsUploading(true);
      const fileReader = new FileReader();
  
      fileReader.onload = async (event) => {
        const arrayBuffer = event.target.result;
  
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const allSheetsData = [];
        const sheetNames = workbook.SheetNames;
  
        for (let i = 1; i < sheetNames.length; i++) {
          const sheetName = sheetNames[i];
          const sheet = workbook.Sheets[sheetName];
  
          // Define the range starting from B5
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            header: ["L1", "L2", "L3", "F1", "F2", "Product", "Description", "Geo", "Conditions"],
            range: "B5", // Starts reading from cell B5
            defval: "", // Default value for empty cells
          });
  
          // Ensure data formatting matches your requirements
          const formattedData = jsonData.map((row) => ({
            L1: row["L1"] || "00",
            L2: row["L2"] || "00",
            L3: row["L3"] || "00",
            F1: row["F1"] || "00",
            F2: row["F2"] || "00",
            Product: row["Product"] || "",
            Description: row["Description"] || "",
            Geo: row["Geo"] || "",
            Conditions: row["Conditions"] || "",
          }));
  
          allSheetsData.push(...formattedData);
        }
  
        console.log(allSheetsData.slice(0, 10)); // Log first 10 rows only
        await uploadToBackendFunctional(allSheetsData);
        alert("File uploaded successfully!");
      };
  
      fileReader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("An error occurred while processing the file.");
    } finally {
      setIsUploading(false);
    }
  };
  

  const uploadToBackendFunctional = async (data) => {
    try {
      setUploadStatus("Uploading data to the server...");
      const response = await fetch(`${API_URL}/upload-functional-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      setUploadStatus(`Upload successful: ${result.message}`);
    } catch (error) {
      console.error("Error uploading data:", error);
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  const uploadToBackendModule = async () => {
    if (fileData) {
      try {
        setIsUploading(true);
        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: fileData }),
        });

        const result = await response.json();
        alert(`Upload successful: ${result.message}`);
      } catch (error) {
        console.error("Error uploading data:", error);
        alert("Upload failed!");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="container">
      <h2>Upload Module Data</h2>

      {/* Module File Upload */}
      
      {/* Drag and Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag and drop files here, or click to select files</p>
        {/* <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
        /> */}
        <input
          id="moduleFile"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="file-preview">
          <h3>Selected Files</h3>
          <ul>
              <li >
                {selectedFile.name}{" "}
                <button onClick={() => removeFile()}>Remove</button>
              </li>
          </ul>
        </div>
      )}

      {/* Upload Button */}
      {/* <button
        className="upload-btn"
        onClick={handleUpload}
        disabled={selectedFiles.length === 0}
      >
        Upload Files
      </button> */}
      <button className="action-btn" onClick={handleUploadModule} disabled={selectedFiles.length === 0}>
        {isUploading ? "Uploading..." : "Upload Modules"}
      </button>
      <button className="action-btn" onClick={handleUploadFunctional} disabled={selectedFiles.length === 0}>
        {isUploading ? "Uploading..." : "Upload Functional Items"}
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
