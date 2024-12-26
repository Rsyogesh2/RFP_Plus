import React, { useState , useContext,useEffect} from "react";
import { AppContext } from '../context/AppContext';
import "./VendorQuery.css"; // Import CSS file
import { TreeSelect } from "antd";

const VendorQuery = () => {
  const [rows, setRows] = useState([
    { rfpRefNo: "", rfpClause: "General", existingDetails: "", clarification: "" },
  ]);
  const [value, setValue] = useState();
  const {  userName ,userPower,sidebarValue,moduleData,setModuleData} = useContext(AppContext); // Access shared state
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
   useEffect(() => {
          async function fetchArray() {
              // const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
              // console.log("result", result.functionalItemDetails); // Log the resolved array
              console.log("userName " + userName)
              
              const l1 ="vendor Query"
              //23/11/2024
              try {
                  const queryParams = new URLSearchParams({ userName, userPower });
                  const response = await fetch(`${API_URL}/api/loadContents?${queryParams}`)
                  console.log(response);
      
                  // Check if the response is okay (status in the range 200-299)
                  if (!response.ok) {
                      throw new Error(`HTTP error! Status: ${response.status}`);
                  }
      
                  const data = await response.json(); // Parse the JSON response
                  console.log(data);  // Handle the fetched data as needed
      
                  //  setItemData(data.itemDetails.l1); // Set the resolved data to local state
                  // setName(data.itemDetails.Name); // Set the resolved data to local state
                  // setModuleData(data);
                  // filterModule(data);
                  setModuleData(data);
                  // setItemData(moduleData.itemDetails.l1); 
                  // setFItem(moduleData.functionalItemDetails);
                  // setSidebarValue(data.itemDetails);
                  // setFItem(data.functionalItemDetails);
                  // console.log(userRole);
              } catch (error) {
                  console.error('Error sending checked items:', error); // Log any errors
              }
      
          }
          fetchArray();
          
      }, []);

  const onChange = (newValue) => {
    setValue(newValue);
  };
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
  console.log(options);
// console.log(options); // Outputs structured dropdown options
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
                <select>
                {options.map((option) => (
                <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
                </select>
              
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
