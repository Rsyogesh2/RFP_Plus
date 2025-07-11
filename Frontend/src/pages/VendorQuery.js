import React, { useState, useContext, useEffect } from "react";
import { AppContext } from '../context/AppContext';
import "./combinedpages.css";
import { TreeSelect } from "antd";

const VendorQuery = ({ rfpNo = "" ,rfpTitle=""}) => {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState([]);
  const [modules, setModules] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [completeLevel, setCompleteLevel] = useState(1);
  const { userName, userPower, userRole, sidebarValue, moduleData = {}, rfpNumber } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

   useEffect(() => {
              const fetchVendor = async () => {
                // if (!userName) {
                //   alert("Please enter both RFP No and Bank Name");
                //   return;
                // }
                try {
                  const response = await fetch(`${API_URL}/fetchVendor?userName=${userName}&&rfpNo=${rfpNo||rfpNumber}&&userPower=${userPower}`);
                  const data = await response.json();
                  setVendorNames(data);
                } catch (error) {
                  console.error('Error fetching data:', error);
                }
              };
              fetchVendor();
            }, [userName]);
          
          

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
        url = "api/vendorQuery-fetch";
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
        if(userPower==="Vendor User" ||  userPower==="User"){
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
           console.log(data.modules);
           setModules(data.modules);
        }
        console.log(combinedRowsData);
        if(userPower==="Super Admin" || userPower==="Vendor Admin"){
          console.log(data.data[0].level?data.data[0].level:1)
        setCompleteLevel(data.data[0].level?data.data[0].level:1);
        }
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
        rfp_no: rfpNo || sidebarValue[0]?.rfp_no || '',
        rfp_title: rfpTitle || sidebarValue[0]?.rfp_title || '',
        bank_name: userPower === "User" ? sidebarValue[0]?.entity_name || '' : '',
        vendor_name: userPower === "User" ? "" : sidebarValue[0]?.entity_name || '',
        created_by: userName,
        level: userPower === "User" && (action === "Back to Maker"|| action === "Save as Draft") ? 1
        : userPower === "Vendor User" && (action === "Back to Maker"|| action === "Save as Draft") ? 5: 
        userPower === "Super Admin" && action === "Completed"? 10: determineLevel(),
        Comments: data.comments || "",
        Priority: data.priority || "Medium",
        Handled_by: [{ name: userName, role: userRole }],
        Action_log: `${action} by ${userName} on ${new Date().toISOString()}`,
        userPower,
        rows,
        selectedVendor:selectedVendor || "",
    };

    payload = adjustStageAndStatus(payload, action, data);
    console.log("Constructed Payload:", payload);
    return payload;
};


console.log(determineLevel())

  const saveAsDraft = async (action) => {
    let payload = constructPayload(action);
    console.log(payload);
   
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
    if( userPower==="Vendor User" || userPower==="Vendor Admin" ){
      fetchData();
    }
    // fetchData();
    if (!moduleData || !moduleData.itemDetails) {
      // return <p>Loading...</p>; // Or show a default message instead of breaking
    }    
    try {
      if(userPower=="Vendor User" || userPower=="User"){
        // if(userRole==="Authorizer" || userRole==="Reviewer"){
        //   // console.log(modules);
        //   setOptions(flattenHierarchy(modules.modules));
        // } else{
          setOptions(flattenHierarchy(moduleData?.itemDetails?.l1 ? moduleData.itemDetails.l1[0] : [])); 
        // }
        
      } else{
        async function getModules() {
          const response = await fetch(`${API_URL}/api/getModules`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
               rfpNo 
            }),
          });
          const allModules = await response.json();
          console.log(allModules.modules);
          setOptions(flattenHierarchy(allModules.modules));
          console.log(flattenHierarchy(allModules.modules))
        }
        getModules();
      }
      console.log(options)
      } catch (error) {
      console.error("Error while setting options:", error);
      setOptions([]); // Fallback to an empty array
    }
    
  }, []);

  const handleDropdownChangeVendor = (event) => {
    const selectedIndex = event.target.value;  // Index is a string
    if (selectedIndex !== "") {
        const selectedObject = vendorNames[parseInt(selectedIndex)]; // Convert to number and access object
        console.log("Selected Vendor Object:", selectedObject);
        setSelectedVendor(selectedObject); // Store the entire object
    } else {
        setSelectedVendor(null); // Reset if no selection
    }
  };
    const fetchData = async () => {
        let url;
        try {
          if (userPower === "User") {
            url = "api/vendorQuery-fetch";
            
          } else if (userPower === "Super Admin") {
            url = "api/vendorQuery-fetch-admin";
            
          }
            const response = await fetch(`${API_URL}/${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  rfpNo: rfpNo || sidebarValue?.[0]?.rfp_no || "",
                  bankName: userPower === "Super Admin" ? sidebarValue[0]?.entity_name || '' : '',
                  vendorName: userPower === "Super Admin" ? "" : sidebarValue[0]?.entity_name || '',
                  userRole,
                  userName,
                  userPower,
                  selectedVendor
                })
            });
            const data = await response.json();
            console.log(data)
            let combinedRowsData
            if(userPower==="Super Admin" || userPower==="Vendor Admin"){
              combinedRowsData = data.data?.reduce((acc, row) => acc.concat(row.rowsData || []), []);
           } else  if(userPower==="Vendor User" ||  userPower==="User"){
            combinedRowsData = data.data.rowsData || [];
           }
           console.log(combinedRowsData);
           // console.log(combinedRowsData)
           setRows(combinedRowsData || []);
            // setSections(data[1]);
            // setCommercialValue(data[0]);
        } catch (error) {
          alert(error || "Failed to fetch data");
        }
    };

  return (
   <div className="vendor-query-container p-6 bg-[#f9fbfd] rounded-xl shadow space-y-6">

    {/* Title */}
    <h4 className="text-xl font-extrabold text-[#2F4F8B] tracking-wide uppercase">
        Vendor Query
    </h4>

    {/* RFP Info */}
    <h3 className="text-base font-semibold text-gray-700">
        {`${rfpNo || sidebarValue[0]?.rfp_no} - ${rfpTitle || sidebarValue[0]?.rfp_title}`}
    </h3>

    {/* Vendor Dropdown */}
    {(userPower === "Super Admin" || userPower === "User") && (
        <div className="flex flex-wrap items-center gap-4 mb-4">

            <select
                onChange={handleDropdownChangeVendor}
                className="w-full md:w-72 p-2.5 border border-gray-300 rounded-md text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F4F8B] shadow-sm"
            >
                <option value="">Select Vendor</option>
                {vendorNames?.map((vName, index) => (
                    <option key={index} value={index}>{vName.entity_name}</option>
                ))}
            </select>

            <button
                onClick={fetchData}
                className="px-6 py-2.5 bg-[#2F4F8B] text-white text-sm font-semibold rounded-md shadow "
            >
                Fetch Data
            </button>

        </div>
    )}

    {/* Query Table - Premium Look */}
    <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-sm text-gray-800">
           <thead className="bg-gradient-to-r from-[#2F4F8B] to-[#1e3669] text-white">
    <tr>
        <th className="px-6 py-4 text-left text-white text-base font-semibold tracking-wide">S.No</th>
        <th className="px-6 py-4 text-left text-white text-base font-semibold tracking-wide">RFP Reference</th>
        <th className="px-6 py-4 text-left text-white text-base font-semibold tracking-wide">Existing Details</th>
        <th className="px-6 py-4 text-left text-white text-base font-semibold tracking-wide">Clarification Needed</th>
        {(rows.some(row => row.clarificationGiven) || userPower === "Super Admin" || userPower === "User") && (
            <th className="px-6 py-4 text-left text-white text-base font-semibold tracking-wide">Clarification Given</th>
        )}
    </tr>
</thead>

            <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row, index) => (
                    <tr key={index} className="hover:bg-[#f9fafc] transition">
                        <td className="px-4 py-3">{index + 1}</td>

                        <td className="px-4 py-3">
                            {userRole === "Maker" && userPower === "Vendor User" ? (
                                <TreeSelect
                                    treeData={options}
                                    value={row.treeValue}
                                    onChange={(value, node) =>
                                        handleInputChange(index, "RFP_Reference", { value, name: node?.name })
                                    }
                                    placeholder="Select"
                                    treeDefaultExpandAll
                                    style={{ width: "100%" }}
                                />
                            ) : (
                                <TreeSelect
                                    treeData={options}
                                    value={row.treeValue}
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#f5f5f5",
                                        color: "#000",
                                        cursor: "default",
                                    }}
                                    open={false}
                                    onClick={(e) => e.preventDefault()}
                                    onKeyDown={(e) => e.preventDefault()}
                                />
                            )}
                        </td>

                        <td className="px-4 py-3">
                            {userRole === "Maker" && userPower === "Vendor User" ? (
                                <textarea
                                    maxLength="400"
                                    value={row.existingDetails}
                                    onChange={(e) => handleInputChange(index, "existingDetails", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#2F4F8B] bg-white"
                                />
                            ) : (
                                row.existingDetails
                            )}
                        </td>

                        <td className="px-4 py-3">
                            {userRole === "Maker" && userPower === "Vendor User" ? (
                                <textarea
                                    maxLength="400"
                                    value={row.clarification}
                                    onChange={(e) => handleInputChange(index, "clarification", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#2F4F8B] bg-white"
                                />
                            ) : (
                                row.clarification
                            )}
                        </td>

                        {(row.clarificationGiven || userPower === "Super Admin" || userPower === "User") && (
                            <td className="px-4 py-3">
                                {userRole === "Maker" && userPower === "User" ? (
                                    <input
                                        type="text"
                                        maxLength="400"
                                        value={row.clarificationGiven}
                                        onChange={(e) => handleInputChange(index, "clarificationGiven", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F8B]"
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
    </div>

    {/* Add Row */}
    {userRole === "Maker" && userPower === "Vendor User" && completeLevel !== 10 && (
        <button
            className="mt-4 px-5 py-2.5 bg-[#B2541B] text-white text-sm font-semibold rounded-md shadow transition"
            onClick={addRow}
        >
            Add Row
        </button>
    )}

    {/* Save Buttons */}
    {(userPower === "Vendor User" || userPower === "User") && completeLevel !== 10 && (
        <div className="flex flex-wrap gap-4 mt-6">
            {userRole === "Maker" && (
                <button
                    className="px-6 py-2.5 bg-gray-200 text-gray-800 text-sm font-semibold rounded-md shadow transition"
                    onClick={() => saveAsDraft("Save as Draft", { action: "Save as Draft" })}
                >
                    Save as Draft
                </button>
            )}
            {userRole !== "Reviewer" && (
                <button
                    className="px-6 py-2.5 bg-[#2F4F8B] text-white text-sm font-semibold rounded-md shadow transition"
                    onClick={() => {
                        if (window.showConfirm("Are you sure you want to submit the query?", "This action cannot be undone.", "warning")) {
                            saveAsDraft("Submit");
                        }
                    }}
                >
                    Submit
                </button>
            )}
        </div>
    )}

    {/* Vendor Admin / Super Admin */}
    {(userPower === "Vendor Admin" || userPower === "Super Admin") && completeLevel !== 10 && (
        <div className="mt-6">
            <button
                className="px-6 py-2.5 bg-[#2F4F8B] text-white text-sm font-semibold rounded-md shadow transition"
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

    {/* Super Admin → Completed */}
    {userPower === "Super Admin" && completeLevel !== 10 && (
        <div className="mt-6">
            <button
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-md shadow  transition"
                onClick={() => {
                    if (window.confirm("Are you sure you want to submit the query?")) {
                        saveAsDraft("Completed");
                    }
                }}
            >
                Submit the Query to Vendor
            </button>
        </div>
    )}

</div>

  );
};

export default VendorQuery;
