import React, { useState, useContext, useEffect } from "react";
import { AppContext } from '../context/AppContext';
import "./combinedpages.css";
import { TreeSelect } from "antd";

const VendorQuery = ({ rfpNo = "" ,rfpTitle=""}) => {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState([]);
  const [modules, setModules] = useState([]);
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
          bankName: userPower === "Super User" ? sidebarValue[0]?.entity_name || '' : '',
          vendorName: userPower === "Super User" ? "" : sidebarValue[0]?.entity_name || '',
          level,
          userRole,
          userName,
          userPower
        }),
      });

      const data = await response.json();
      console.log(data);

      //getSavedModule
      if (response.ok) {
        let combinedRowsData;
        if(userPower==="Vendor User"){
           combinedRowsData = data.data.rowsData || [];
           if(userRole==="Authorizer"){
            const response = await fetch(`${API_URL}/api/getSavedModule`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                rfpNo: rfpNo || sidebarValue?.[0]?.rfp_no || ""
              }),
            });
            const module = await response.json();
            console.log(module);
            setModules(module)
            // combinedRowsData = module.modules?.reduce((acc, row) => acc.concat(row.rowsData || []), []);
            console.log("module");
           }
        } else if(userPower==="Super Admin" || userPower==="Vendor Admin"){
           combinedRowsData = data.data?.reduce((acc, row) => acc.concat(row.rowsData || []), []);
        }
        console.log(combinedRowsData);
        // console.log(combinedRowsData)
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

  
  const currentLevel = () => {
    console.log("vuserRole : " + userRole)
    switch (true) {
        case userPower === "User" && userRole === "Maker":
            return 1;
        case userPower === "User" && userRole === "Authorizer":
            return 2;
        case userPower === "User" && userRole === "Reviewer":
            return 3;
        case userPower === "Super Admin" || userRole === "Super Admin":
            return 4;
        case userPower === "Vendor User" && userRole === "Maker":
            return 5;
        case userPower === "Vendor User" && userRole === "Authorizer":
            return 6;
        case userPower === "Vendor User" && userRole === "Reviewer":
            return 7;
        case userPower === "Vendor Admin":
            return 8;
        default:
            return null;
    }
};
const nextStatus = () => {
    const levelNum = currentLevel();
    switch (levelNum) {
        case 1:
            return "Bank_Pending_Authorization";
        case 2:
            return "Bank_Pending_Reviewer";
        case 3:
            return "Bank_Pending_Admin";
        case 4:
            return "Vendor_Pending_Maker";
        case 5:
            return "Vendor_Pending_Authorization";
        case 6:
            return "Vendor_Pending_Reviewer";
        case 7:
            return "Vendor_Pending_Admin";
    }
}
const determineLevel = () => {
    if (userPower === "User" && userRole === "Maker") return 2;
    if (userPower === "User" && userRole === "Authorizer") return 3;
    if (userPower === "User" && userRole === "Reviewer") return 4;
    if (userPower === "Super Admin") return 5;
    if (userPower === "Vendor User" && userRole === "Maker") return 6;
    if (userPower === "Vendor User" && userRole === "Authorizer") return 7;
    if (userPower === "Vendor User" && userRole === "Reviewer") return 8;
    if (userPower === "Vendor Admin") return 4;
    return 5;
};
const adjustStageAndStatus = (payload, action, data) => {
    if (action === "Save as Draft") {
        if(currentLevel()==5){
          payload.stage = "Draft";
          payload.Status = "Vendor_Pending_Maker";
        } else if(currentLevel()==1){
          payload.stage = "Draft";
          payload.Status = "Bank_Pending_Maker"; 
        }
        payload.assigned_to = null;
    } else if (["Submit", "Approve", "Submit to Bank"].includes(action)) {
        console.log(nextStatus())
        payload.Status = nextStatus();
        payload.assigned_to = data.assignedTo || null;
    } else if (action === "Reject") {
        payload.stage = "Rejected";
        payload.Status = "Rejected";
        payload.assigned_to = null;
    } else if (action === "Back to Maker"){
        payload.stage = "Draft";
        payload.Status = "Bank_Pending_Maker";
        payload.assigned_to = null;
    }
    payload.stage = userPower === "Vendor User" ? "Vendor"
        : userPower === "User" ? "Bank"
            : userPower === "Vendor Admin" ? "Bank"
                : userPower === "Super Admin" ? "Vendor"
                    : "";
    return payload;
};
const constructPayload = (action, data = {}) => {

    let payload = {
        rfp_no: sidebarValue[0]?.rfp_no || '',
        rfp_title: sidebarValue[0]?.rfp_title || '',
        bank_name: userPower === "User" ? sidebarValue[0]?.entity_name || '' : '',
        vendor_name: userPower === "User" ? "" : sidebarValue[0]?.entity_name || '',
        created_by: userName,
        level: userPower === "User" && data.action === "Back to Maker" ? 1
        : userPower === "Vendor User" && data.action === "Back to Maker" ? 5: determineLevel(),
        Comments: data.comments || "",
        Priority: data.priority || "Medium",
        Handled_by: [{ name: userName, role: userRole }],
        Action_log: `${action} by ${userName} on ${new Date().toISOString()}`,
        rows
    };

    payload = adjustStageAndStatus(payload, action, data);
    console.log("Constructed Payload:", payload);
    return payload;
};


console.log(determineLevel())


//   const getNextLevel = () => {
//     if (userRole === "Maker") return "Authorizer";
//     if (userRole === "Authorizer") return "Reviewer";
//     if (userRole === "Reviewer") return "Vendor Admin";
//     if (userRole === "Vendor Admin") return "Super Admin";
//     return "Unknown";
//   };
//   const currentLevel =()=>{
//     return userPower === "Vendor User" && userRole === "Maker" ? 1 : userPower === "Vendor User" 
//         && userRole === "Authorizer" ? 2 : userPower === "Vendor User" && userRole === "Viewer" ? 3 :
//         userPower === "Vendor Admin" || userRole === "Vendor Admin" ? 4:5;
//   }
//   const constructPayload = (action, data) => {
//     let payload = {
//         rfp_no: data.rfp_no,
//         rfp_title: data.rfp_title,
//         vendor_name: data.vendor_name,
//         bank_name: data.bank_name,
//         created_by: data.userName,
//         rows_data: data.rows,
//         level: userPower === "Vendor User" && userRole === "Maker" ? 2 : userPower === "Vendor User" 
//         && userRole === "Authorizer" ? 3 : userPower === "Vendor User" && userRole === "Viewer" ? 4 : 1,
//         comments: data.comments || "",
//         priority: data.priority || "Medium",
//         handled_by: [{ name: data.userName, role: userRole }],
//         attachments: data.attachments || null,
//         action_log: `${action} by ${data.userName} on ${new Date().toISOString()}`,
//     };

//     if (action === "Save as Draft") {
//         payload.stage = "Draft";
//         payload.status = "Draft";
//         payload.assigned_to = null;
//     } else if (action === "Submit") {
//         // payload.stage = userPower === "Vendor User" && userRole === "Maker" ? "Pending_Authorizer" 
//         // : userPower === "Vendor User" && userRole === "Authorizer" ? "Pending_Reviewer" 
//         // : userPower === "Vendor User" && userRole === "Viewer" ? "Pending_Vendor_Admin":"Pending_Super_Admin";
//         payload.stage = "Vendor";
//         payload.status = "Pending_Authorization";
//         payload.assigned_to = data.assignedTo || null;
//     } else if (action === "Approve" && userRole === "Authorizer") {
//         payload.stage = "Vendor";
//         payload.status = "Pending_Review";
//         payload.assigned_to = data.assignedTo || null;
//     }  else if (action === "Approve" && userRole === "Viewer") {
//       payload.stage = "Vendor";
//       payload.status = "Pending_Vendor_Admin";
//       payload.assigned_to = data.assignedTo || null;
//     } else if (action === "Submit to Bank") {
//       payload.stage = "Bank";
//       payload.status = "Pending_Super_Admin";
//       payload.assigned_to = data.assignedTo || null;
//   } else if (action === "Reject") {
//         payload.stage = "Rejected";
//         payload.status = "Rejected";
//         payload.assigned_to = null;
//     }

//     return payload;
// };

  const saveAsDraft = async (action) => {
    let payload = constructPayload(action);
    console.log(payload);
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
    const fetchData = async () => {
      await fetchVendorQueries();
    };
    fetchData();
    if (!moduleData || !moduleData.itemDetails) {
      // return <p>Loading...</p>; // Or show a default message instead of breaking
    }    
    try {
      if(userPower=="Vendor User"){
        if(userRole==="Authorizer" || userRole==="Reviewer"){
          // console.log(modules);
          setOptions(flattenHierarchy(modules.modules));
        } else{
          setOptions(flattenHierarchy(moduleData?.itemDetails?.l1 ? moduleData.itemDetails.l1 : [])); 
        }
        
      } else{
        console.log(moduleData.modules)
        setOptions(flattenHierarchy( moduleData.modules));
        console.log(flattenHierarchy(moduleData.modules))
       
      }
      console.log(options)
      } catch (error) {
      console.error("Error while setting options:", error);
      setOptions([]); // Fallback to an empty array
    }
    
  }, []);

  return (
    <div className="vendor-query-container">
      {/* {sidebarValue.length > 0 && (
      
      )} */}
      <h4>Vendor Query</h4>
      <>
          <h3>{`${rfpNo || sidebarValue[0].rfp_no} - ${rfpTitle || sidebarValue[0].rfp_title}`}</h3>
        </>
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
                  <TreeSelect
                  treeData={options}
                  value={row.treeValue}
                  // treeDefaultExpandAll
                  style={{
                    width: "100%",
                    backgroundColor: "#f5f5f5", // Light gray to give a read-only look
                    color: "#000", // Keep text color standard
                    cursor: "default", // Standard cursor
                  }}
                  open={false}
                  onClick={(e) => e.preventDefault()} // Prevent dropdown from opening
                  onKeyDown={(e) => e.preventDefault()} // Prevent keyboard interaction
                />
                
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

      {userPower === "Vendor User" && (
        <div className="save-button-container">
          {userRole==="Maker" && <button className="save-btn" onClick={()=>{saveAsDraft("Save as Draft")}}>Save as Draft</button>}
          <button className="submit-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to submit the query?")) {
                saveAsDraft("Submit");
              }
            }}
          >Submit</button>
        </div>
      )}
      {(userPower === "Vendor Admin" || userPower === "Super Admin") && (
        <div className="save-button-container">
          <button className="submit-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to submit the query?")) {
                saveAsDraft("Submit");
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
