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
