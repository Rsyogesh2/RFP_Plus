import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const UploadFile = () => {
  const [fileData, setFileData] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: "A",
        range: 5, // Start reading from row 6 (0-indexed as 5)
      });
  
      // Map the data to extract columns B and C
      const formattedData = sheetData.map((row) => ({
        L1_Code: row.B,
        L1_Description: row.C,
      })).filter(row => row.L1_Code && row.L1_Description); // Filter out empty rows
  
      setFileData(formattedData);
    };
    reader.readAsArrayBuffer(file);
  };
  

  const handleSubmit = async () => {
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
      <button onClick={handleSubmit}>Upload</button>
    </div>
  );
};

export default UploadFile;
