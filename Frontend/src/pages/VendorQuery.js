import React, { useState , useContext} from "react";
import { AppContext } from '../context/AppContext';
import "./VendorQuery.css"; // Import CSS file
import { TreeSelect } from "antd";

const VendorQuery = () => {
  const [rows, setRows] = useState([
    { rfpRefNo: "", rfpClause: "General", existingDetails: "", clarification: "" },
  ]);
  const [value, setValue] = useState();

  const onChange = (newValue) => {
    setValue(newValue);
  };
  const {  userName ,sidebarValue,moduleData} = useContext(AppContext); // Access shared state
      console.log(moduleData.itemDetails.l1)
  // Sample options for RFP Ref No. (L2, L3 level modules)
  // const rfpRefOptions = moduleData.itemDetails.l1.map(module => ({
  //   value: module.name,
  //   label: module.name
  // }));
  
// Recursive function to flatten names into hierarchy
const flattenHierarchy = (moduleData) => {
  return moduleData.map((item) => ({
    label: item.name,
    value: item.code,
    children: item.l2 ? flattenHierarchy(item.l2.map((l2) => l2)) : undefined,
  }));
};

const options = moduleData.itemDetails.l1.length>0?flattenHierarchy(moduleData.itemDetails.l1):"";
console.log(options); // Outputs structured dropdown options
  const fetchUseRfpNo = async (rfpNo) => {
    try {
      const queryParams = new URLSearchParams({ rfpNo,userName });
      const response = await fetch(`/api/assignRFPUserDetails?${queryParams}`);
      const data = await response.json();
      console.log(data.modules);
      // setAssignedUsers(data.assignedUsers);
    } catch (error) {
      console.error("Error fetching RFP details:", error.response?.data || error.message);
    }
  };

  const addRow = () => {
    setRows([
      ...rows,
      { rfpRefNo: "", rfpClause: "General", existingDetails: "", clarification: "" },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "rfpRefNo") {
      updatedRows[index].rfpClause =
        value === "General"
          ? "General"
          : value.includes("L2")
          ? "L2 Reference"
          : "L3 Reference";
    }

    setRows(updatedRows);
  };

  const saveAsDraft = () => {
    console.log("Saved Data:", rows);
    alert("Data saved as draft!");
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
            <th>RFP Ref No</th>
            <th>RFP Reference Clause</th>
            <th>Existing Details</th>
            <th>Clarification Needed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
              {/* <TreeSelect
                  treeData={options}
                  value={value}
                  onChange={onChange}
                  placeholder="Please select"
                  treeDefaultExpandAll
                  style={{ width: "100%" }}
                /> */}
                {/* <select
                  value={row.rfpRefNo}
                  onChange={(e) => handleInputChange(index, "rfpRefNo", e.target.value)
                    
                  }
                  onClick={(e) =>fetchUseRfpNo(sidebarValue[0].rfp_no)}
                >
                  <option value="">Select</option>
                  {rfpRefOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select> */}
              </td>
              <td>{row.rfpClause}</td>
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
