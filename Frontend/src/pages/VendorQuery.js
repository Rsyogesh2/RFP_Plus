import React, { useState, useContext, useEffect } from "react";
import { AppContext } from '../context/AppContext';
import "./VendorQuery.css";
import { TreeSelect } from "antd";

const VendorQuery = ({rfpNo=""}) => {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState([]);
  const { userName, userPower, userRole, sidebarValue, moduleData } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchVendorQueries = async () => {
    let url;
    let level
    try {
      if(userPower=="Vendor User"){
        url = "api/vendorQuery-fetch";
        level="Vendor"
      } else if(userPower=="Vendor Admin"){
        url = "api/vendorQuery-fetch-admin"
         level="Vendor"
      } else if(userPower=="Super Admin"){
        url = "api/vendorQuery-fetch-admin";
         level="Bank"
      } else{
        url = "api/vendorQuery-fetch-admin"
      }
      const response = await fetch(`${API_URL}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rfpNo:  rfpNo || sidebarValue[0].rfp_no,
          vendorName: sidebarValue[0]?.entity_name,
          bankName: "Bank Name",
          level:level,
          stage:userRole,
          userName:userName
        }),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        // Assuming `data.data` is the response structure
        if(data.data.length>0){
        const combinedRowsData = data.data.reduce((accumulator, currentRow) => {
          return accumulator.concat(currentRow.rowsData || []); // Merge rowsData from all rows
        }, []);

        // Set the combined data
        setRows(combinedRowsData);

        // Log to console
        console.log(combinedRowsData);
      } else{
        setRows(data.data.rowsData || []);
        console.log(rows)
      }
      } else {
        alert(data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data.");
    }
  };

  const flattenHierarchy = (data, prefix = "") => {
    return data.map((item, index) => {
      const currentPrefix = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
      return {
        title: `${currentPrefix}. ${item.name}`, // Use `title` for the label
        value: item.code, // Use `value` for the unique key
        name: item.name,  // Include the name in the data
        children: item.l2 ? flattenHierarchy(item.l2, currentPrefix) : undefined,
      };
    });
  };


  const addRow = () => {
    if (userRole === "Maker") {
      setRows([
        ...rows,
        { RFP_Reference: "", treeValue: "", existingDetails: "", clarification: "" },
      ]);
    }
  };

  const handleInputChange = (index, field, data) => {
    const updatedRows = [...rows];
    console.log(field);
    console.log(data);

    if (field === "RFP_Reference") {
      updatedRows[index].treeValue = data.value;
      updatedRows[index].name = data.name;
    } else {
      updatedRows[index][field] = data;
    }
    setRows(updatedRows);
  };
  const getLevel = () => {
    if (userPower === "User") {
      return "Bank";
    } else if (userPower === "Super Admin") {
      return "Bank";
    } else if (userPower === "Vendor User") {
      return "Vendor";
    } else if (userPower === "Vendor Admin") {
      return "Vendor";
    } else {
      return "Unknown"; // Default value
    }
  };
  const nextGetLevel = () => {
    if (userPower === "User") {
      return "Bank";
    } else if (userPower === "Super Admin") {
      return "Vendor";
    } else if (userPower === "Vendor User") {
      return "Vendor";
    } else if (userPower === "Vendor Admin") {
      return "Bank";
    } else {
      return "Unknown"; // Default value
    }
  };
  const nextGetStage = () => {
    if (userRole === "Maker") {
      return "Authorizer";
    } else if (userRole === "Authorizer") {
      return "Viewer";
    } else if (userRole === "Viewer") {
      return "Vendor Admin";
    } else if (userRole === "Vendor Admin") {
      return "Super Admin";
    } else if (userRole === "Super Admin") {
      return "Vendor Admin";
    } else {
      return "Unknown"; // Default value
    }
  };
  // Example usage
 
  const saveAsDraft = async () => {
    const payload = {
      rfpNo: sidebarValue[0].rfp_no,
      rfpTitle: sidebarValue[0].rfp_title,
      vendorName: sidebarValue[0].entity_name,
      bankName: "Bank Name",
      createdBy: userName,
      stage: nextGetStage(),
      level: nextGetLevel(),
      rows,
      stageNumber:2
    };
    console.log(payload.level)

    try {
      const response = await fetch(`${API_URL}/api/vendorQuery-save-draft`, {
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

  useEffect(() => {
    // Fetch existing queries and dropdown options
    fetchVendorQueries();
    setOptions(flattenHierarchy(moduleData.itemDetails.l1 || []));
  }, [moduleData]);

  return (
    <div className="vendor-query-container">
      {sidebarValue.length>0 &&(
        <>
         {/* <h2>{sidebarValue[0].entity_name}</h2> */}
         <h3>{sidebarValue[0].rfp_no} - {sidebarValue[0].rfp_title}</h3>
        </>
      )    
      }
      <h4>Vendor Query</h4>
      <table className="vendor-query-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>RFP Reference</th>
            <th>Existing Details</th>
            <th>Clarification Needed</th>
            {(getLevel() === "Bank" || (rows && rows[0]?.clarificationGiven)) && (
            <th>Clarification Given</th>
        )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            console.log(row)
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {userRole === "Maker" ? (
                    // Editable TreeSelect for Maker
                    <TreeSelect
                      treeData={options}
                      value={row.treeValue}
                      onChange={(value, node) => {
                        handleInputChange(index, "RFP_Reference", {
                          value,                  // The selected value
                          label: node?.title || "", // The title displayed in the dropdown
                          name: node?.name || "",   // The name associated with the node
                        });
                      }}
                      placeholder="Please select"
                      treeDefaultExpandAll
                      style={{ width: "100%" }}
                    />
                  ) : (
                    // Non-editable TreeSelect for other roles
                    <TreeSelect
                      treeData={options}
                      value={row.treeValue}
                      // disabled // Makes the TreeSelect non-interactive
                      placeholder="Please select"
                      treeDefaultExpandAll
                      style={{
                        width: "100%",
                        backgroundColor: "transparent", // Make background transparent
                        border: "none", // Remove border
                        padding: "0", // Remove padding
                        textAlign: "left", // Align text left
                      }}
                      dropdownStyle={{ display: "none" }} // Hide the dropdown arrow
                      valueRender={(value) => <span>{value}</span>} // Render the value as text
                    />

                    //   <span>
                    //   {row.treeValue?.label || row.treeValue?.value || "N/A"}  {/* Render label or value */}
                    // </span>
                  )}
                </td>

                <td>
                  {userRole === "Maker" ? (
                    <input
                      type="text"
                      maxLength="400"
                      value={row.existingDetails}
                      onChange={(e) => handleInputChange(index, "existingDetails", e.target.value)}
                    />
                  ) : (
                    row.existingDetails
                  )}
                </td>
                <td>
                  {userRole === "Maker" ? (
                    <input
                      type="text"
                      maxLength="400"
                      value={row.clarification}
                      onChange={(e) => handleInputChange(index, "clarification", e.target.value)}
                    />
                  ) : (
                    row.clarification
                  )}
                </td>
                {(getLevel() === "Bank" || (rows && rows[0]?.clarificationGiven)) && (
            <td>
            <input
                  type="text"
                  maxLength="400"
                  value={row.clarificationGiven}
                  onChange={(e) => handleInputChange(index, "clarificationGiven", e.target.value)}
                />
                </td>
              )}
                {/* {getLevel()==="Bank" && (<td>
                <input
                      type="text"
                      maxLength="400"
                      value={row.clarificationGiven}
                      onChange={(e) => handleInputChange(index, "clarificationGiven", e.target.value)}
                    />
                </td>)
                } */}
              </tr>
            )
          })}
        </tbody>
      </table>

      {userRole === "Maker" && (
        <button className="add-row-button" onClick={addRow}>
          Add Row
        </button>
      )}

      {userRole === "Maker" && (
        <div className="save-button-container">
          <button onClick={saveAsDraft}>Save as Draft</button>
        </div>
      )}
       {(userPower === "Vendor Admin" ||userPower === "Super Admin")&& (
    <div className="save-button-container">
    <button
      onClick={() => {
        const userConfirmed = window.confirm("Are you sure you want to submit the query?");
        if (userConfirmed) {
          saveAsDraft();
        }
      }}
    >
      Submit the Query
    </button>
  </div>
)}
    </div>
  );
};

export default VendorQuery;
