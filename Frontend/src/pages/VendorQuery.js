import React, { useState, useContext, useEffect } from "react";
import { AppContext } from '../context/AppContext';
import "./VendorQuery.css"; // Import CSS file
import { TreeSelect } from "antd";

const VendorQuery = () => {
  const [rows, setRows] = useState([
    { RFP_Reference: "", treeValue: "", existingDetails: "", clarification: "" },
  ]);
  const [value, setValue] = useState();
  
  
  const { userName, userPower, sidebarValue, moduleData, setModuleData } = useContext(AppContext); // Access shared state
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


  const onChange = (newValue) => {
    console.log("Selected Value:", newValue);
    setValue(newValue);
  };
  // const handleTreeSelectChange = (index, newValue) => {
  //   console.log(index,newValue);
  //   const updatedRows = [...rows];
  //   updatedRows[index].treeValue = newValue;
  //   setRows(updatedRows);
  // };

  // Recursive function to flatten names into hierarchy
  const flattenHierarchy = (moduleData) => {
    return moduleData.map((item) => ({
      label: item.name,
      value: item.code,
      children: item.l2 ? flattenHierarchy(item.l2.map((l2) => l2)) : undefined,
    }));
  };
  const options = moduleData.itemDetails.l1.length > 0 ? flattenHierarchy(moduleData.itemDetails.l1) : "";
  console.log(options);
  // console.log(options); // Outputs structured dropdown options

  const addRow = () => {
    setRows([
      ...rows,
      { RFP_Reference: "",  existingDetails: "", clarification: "" },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    
    if(field==="RFP_Reference"){
      updatedRows[index][field] = value.target.value;
    } else {
      updatedRows[index][field] = value;
    }
    updatedRows[index].treeValue = value;
    setRows(updatedRows);
  };

  const saveAsDraft = async () => {
    console.log("Total Rows :"+rows);
    const payload = {
      rfpNo: sidebarValue[0].rfp_no,
      rfpTitle: "<RFP Title>",
      vendorName: "Vendor Name",
      bankName: "Bank Name",
      createdBy: userName,
      stage: "Autherisor",
      rows,
    };
  
    try {
      const response = await fetch(`${API_URL}/vendorQuery-save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("An error occurred while saving the draft.");
    }
  };
  

  return (
    <div className="vendor-query-container">
      <h2>Name of the Vendor</h2>
      <h3>{sidebarValue[0].rfp_no} - &lt; RFP Title &gt;</h3>
      <h4>Vendor Query</h4>

      <table className="vendor-query-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>RFP Reference</th>
            <th>Existing Details</th>
            <th>Clarification Needed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                {options.length > 0 && (
                 <TreeSelect
                 treeData={options}
                 value={row.treeValue} // Row-specific value
                 onChange={(e) => handleInputChange(index, "RFP_Reference", e)} // Row-specific handler
                 placeholder="Please select"
                 treeDefaultExpandAll
                 style={{ width: "100%" }}
               />
                )}
              </td>

              <td>
                <input
                  type="text"
                  maxLength="400"
                  value={row.existingDetails}
                  onChange={(e) => handleInputChange(index, "existingDetails", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  maxLength="400"
                  value={row.clarification}
                  onChange={(e) => handleInputChange(index, "clarification", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-row-button" onClick={addRow}>
        Add Row
      </button>

      <div className="save-button-container">
        <button onClick={saveAsDraft}>Save as Draft</button>
      </div>
    </div>
  );
};

export default VendorQuery;



