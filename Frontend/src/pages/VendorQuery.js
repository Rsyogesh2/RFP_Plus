import React, { useState, useContext, useEffect } from "react";
import { AppContext } from '../context/AppContext';
import "./combinedpages.css";
import { TreeSelect } from "antd";

const VendorQuery = ({ rfpNo = "" }) => {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState([]);
  const { userName, userPower, userRole, sidebarValue, moduleData = {} } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchVendorQueries = async () => {
    let url;
    let level;

    try {
      level=currentLevel();
      if (userPower === "Vendor User") {
        url = "api/vendorQuery-fetch";
        // level = "Vendor";
      } else if (userPower === "Vendor Admin") {
        url = "api/vendorQuery-fetch-admin";
        // level = "Vendor";
      } else if (userPower === "Super Admin") {
        url = "api/vendorQuery-fetch-admin";
        // level = "Bank";
      } else {
        url = "api/vendorQuery-fetch-admin";
        // level = "Unknown";
      }

      const response = await fetch(`${API_URL}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rfpNo: rfpNo || sidebarValue?.[0]?.rfp_no || "",
          vendorName: sidebarValue?.[0]?.entity_name || "",
          bankName: "Bank Name",
          level,
          stage: userRole,
          userName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const combinedRowsData = data.data?.reduce((acc, row) => acc.concat(row.rowsData || []), []);
        setRows(combinedRowsData || []);
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
        title: `${currentPrefix}. ${item.name}`,
        value: item.code,
        name: item.name,
        children: item.l2 ? flattenHierarchy(item.l2, currentPrefix) : undefined,
      };
    });
  };

  const addRow = () => {
    if (userRole === "Maker") {
      setRows([...rows, { RFP_Reference: "", treeValue: "", existingDetails: "", clarification: "" }]);
    }
  };

  const handleInputChange = (index, field, data) => {
    const updatedRows = [...rows];
    if (field === "RFP_Reference") {
      updatedRows[index].treeValue = data.value;
      updatedRows[index].name = data.name;
    } else {
      updatedRows[index][field] = data;
    }
    setRows(updatedRows);
  };

  const getNextLevel = () => {
    if (userRole === "Maker") return "Authorizer";
    if (userRole === "Authorizer") return "Reviewer";
    if (userRole === "Reviewer") return "Vendor Admin";
    if (userRole === "Vendor Admin") return "Super Admin";
    return "Unknown";
  };
  const currentLevel =()=>{
    return userPower === "Vendor User" && userRole === "Maker" ? 1 : userPower === "Vendor User" 
        && userRole === "Authorizer" ? 2 : userPower === "Vendor User" && userRole === "Viewer" ? 3 :
        userPower === "Vendor Admin" || userRole === "Vendor Admin" ? 4:5;
  }
  const constructPayload = (action, data) => {
    let payload = {
        rfp_no: data.rfp_no,
        rfp_title: data.rfp_title,
        vendor_name: data.vendor_name,
        bank_name: data.bank_name,
        created_by: data.userName,
        rows_data: data.rows,
        level: userPower === "Vendor User" && userRole === "Maker" ? 2 : userPower === "Vendor User" 
        && userRole === "Authorizer" ? 3 : userPower === "Vendor User" && userRole === "Viewer" ? 4 : 1,
        comments: data.comments || "",
        priority: data.priority || "Medium",
        handled_by: [{ name: data.userName, role: userRole }],
        attachments: data.attachments || null,
        action_log: `${action} by ${data.userName} on ${new Date().toISOString()}`,
    };

    if (action === "Save as Draft") {
        payload.stage = "Draft";
        payload.status = "Draft";
        payload.assigned_to = null;
    } else if (action === "Submit") {
        // payload.stage = userPower === "Vendor User" && userRole === "Maker" ? "Pending_Authorizer" 
        // : userPower === "Vendor User" && userRole === "Authorizer" ? "Pending_Reviewer" 
        // : userPower === "Vendor User" && userRole === "Viewer" ? "Pending_Vendor_Admin":"Pending_Super_Admin";
        payload.stage = "Vendor";
        payload.status = "Pending_Authorization";
        payload.assigned_to = data.assignedTo || null;
    } else if (action === "Approve" && userRole === "Authorizer") {
        payload.stage = "Vendor";
        payload.status = "Pending_Review";
        payload.assigned_to = data.assignedTo || null;
    }  else if (action === "Approve" && userRole === "Viewer") {
      payload.stage = "Vendor";
      payload.status = "Pending_Vendor_Admin";
      payload.assigned_to = data.assignedTo || null;
    } else if (action === "Submit to Bank") {
      payload.stage = "Bank";
      payload.status = "Pending_Super_Admin";
      payload.assigned_to = data.assignedTo || null;
  } else if (action === "Reject") {
        payload.stage = "Rejected";
        payload.status = "Rejected";
        payload.assigned_to = null;
    }

    return payload;
};

  const saveAsDraft = async () => {
    let payload;
    // const payload = {
    //   rfpNo: sidebarValue[0]?.rfp_no,
    //   rfpTitle: sidebarValue[0]?.rfp_title,
    //   vendorName: sidebarValue[0]?.entity_name,
    //   bankName: "Bank Name",
    //   createdBy: userName,
    //   stage: getNextLevel(),
    //   level: getNextLevel(),
    //   rows,
    //   stageNumber: 2,
    // };
    

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
    fetchVendorQueries();
    if (!moduleData || !moduleData.itemDetails) {
      return <p>Loading...</p>; // Or show a default message instead of breaking
    }    
    try {
      setOptions(flattenHierarchy(moduleData?.itemDetails?.l1 ? moduleData.itemDetails.l1 : []));
    } catch (error) {
      console.error("Error while setting options:", error);
      setOptions([]); // Fallback to an empty array
    }
    
  }, [moduleData]);

  return (
    <div className="vendor-query-container">
      {sidebarValue.length > 0 && (
        <>
          <h3>{`${sidebarValue[0].rfp_no} - ${sidebarValue[0].rfp_title}`}</h3>
        </>
      )}
      <h4>Vendor Query</h4>
      <table className="vendor-query-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>RFP Reference</th>
            <th>Existing Details</th>
            <th>Clarification Needed</th>
            {rows.some(row => row.clarificationGiven) && <th>Clarification Given</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                {userRole === "Maker" ? (
                  <TreeSelect
                    treeData={options}
                    value={row.treeValue}
                    onChange={(value, node) =>
                      handleInputChange(index, "RFP_Reference", {
                        value,
                        name: node?.name,
                      })
                    }
                    placeholder="Select"
                    treeDefaultExpandAll
                    style={{ width: "100%" }}
                  />
                ) : (
                  row.treeValue || "N/A"
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
              {row.clarificationGiven && (
                <td>
                  {userRole === "Authorizer" ? (
                    <input
                      type="text"
                      maxLength="400"
                      value={row.clarificationGiven}
                      onChange={(e) => handleInputChange(index, "clarificationGiven", e.target.value)}
                    />
                  ) : (
                    row.clarificationGiven
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {userRole === "Maker" && (
        <button className="add-row-button" onClick={addRow}>Add Row</button>
      )}

      {userRole === "Maker" && (
        <div className="save-button-container">
          <button onClick={saveAsDraft}>Save as Draft</button>
        </div>
      )}

      {(userPower === "Vendor Admin" || userPower === "Super Admin") && (
        <div className="save-button-container">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to submit the query?")) {
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
