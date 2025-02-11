import React, { useState, useEffect, useContext } from "react";
import VendorQuery from "../VendorQuery";
import RFPReqTable from "../../components/RFP_Table/RFPReqTable";
import { AppContext } from "../../context/AppContext";
import ScoringDashboard from "../Dashboard/Dashboard.js";
import FinalEvaluation from "../FinalEvaluation";
import RFPVendorTable from "../../components/RFP_Table/RFPVendorTable";
import "./RFPListTable.css";

const RFPListTable = () => {
  const actions = [
    "View RFP",
    "Final RFP",
    "Submitted RFP",
    "Vendor Query",
    "Final Evaluation",
    "Dashboard",
  ];

  const [data, setData] = useState([]);
  const [actionName, setActionName] = useState();
  const [selectedRfpNo, setSelectedRfpNo] = useState(null);
  const [selectedRfpTitle, setSelectedRfpTitle] = useState(null);
  const [vendorNames, setVendorNames] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [visibleState, setVisibleState] = useState({
    vendor: false,
    viewrfp: false,
    submitrfp: false,
    finalrfp: false,
    dashboard: false,
    finalevaluation: false,
    vendorquery: false,
  });

  const { moduleData, userRole, setModuleData, userName, userPower } =
    useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    setData(moduleData?.rfps || []);
  }, [moduleData]);

  useEffect(() => {
    if (!selectedRfpNo) return;
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${API_URL}/fetchVendor?userName=${userName}&&rfpNo=${selectedRfpNo}`
        );
        const data = await response.json();
        setVendorNames(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, [selectedRfpNo]);

  const handleSeeQuery = async (rfpNo, rfpTitle, action) => {
    setActionName(action);

    if (visibleState[action.toLowerCase().replace(/\s/g, "")]) {
      setVisibleState((prev) => ({
        ...prev,
        [action.toLowerCase().replace(/\s/g, "")]: false,
      }));
      return;
    }
    
    setSelectedRfpNo(rfpNo);
    setSelectedRfpTitle(rfpTitle);
  //   const actionKey = action.toLowerCase().replace(/\s/g, ""); // Normalize key (e.g., "View RFP" -> "viewrfp")

  // setActionName(action);

  // // Toggle: If it's already true, set it to false and return
  // setVisibleState((prev) => {
  //   const newState = { ...prev, [actionKey]: !prev[actionKey] };

  //   // If turning off, stop execution
  //   if (!newState[actionKey]) return newState;

  //   // Otherwise, set selected RFP details and proceed with data fetching
  //   setSelectedRfpNo(rfpNo);
  //   setSelectedRfpTitle(rfpTitle);

  //   return newState;
  // });

  // if (visibleState[actionKey]) return; // Stop execution if we just hid the component


    if (action === "Submitted RFP") {
      setVisibleState((prev) => ({
        vendor: !prev.vendor,
        viewrfp: false,
        submitrfp: false,
        finalrfp: false,
        dashboard: false,
        finalevaluation: false,
        vendorquery: false,
      }));
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        userName,
        userPower,
        userRole,
        rfpNo,
        actionName: action,
      });
      if(action=="View RFP"||action=="Final RFP"||action=="Sumbitted RFP"){
        let url = `${API_URL}/api/getSavedData?${queryParams}`;
        if (userPower === "User" || userPower === "Vendor User") {
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
        }
  
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const data = await response.json();
        setModuleData((prevState) => ({ ...prevState, ...data }));
    
      }
      
      setVisibleState({
        vendor: false,
        viewrfp: action === "View RFP",
        submitrfp: action === "Submitted RFP",
        finalrfp: action === "Final RFP",
        dashboard: action === "Dashboard",
        finalevaluation: action === "Final Evaluation",
        vendorquery: action === "Vendor Query",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDropdownChangeVendor = (event) => {
    const selectedIndex = parseInt(event.target.value);
    setSelectedVendor(vendorNames[selectedIndex] || null);
  };

  const fetchSubmittedRFP = async () => {
    if (!selectedVendor) return;

    try {
      const queryParams = new URLSearchParams({
        userName,
        userPower,
        userRole,
        rfpNo: selectedRfpNo,
        selectedVendor: selectedVendor.id,
        actionName: "Submitted RFP",
      });

      const url = `${API_URL}/api/getSavedData?${queryParams}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setModuleData((prev) => ({ ...prev, ...data }));

      setVisibleState((prev) => ({ ...prev, submitrfp: !prev.submitrfp }));
    } catch (error) {
      console.error("Error fetching Submitted RFP:", error);
    }
  };

  return (
    <div className="vendor-query-container">
      <table className="vendor-query-table">
        <thead className="rfptablelist-header">
          <tr>
            <th>RFP No</th>
            <th>RFP Title</th>
            {actions.map((action, idx) => (
              <th key={idx}>Action</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.RFP_No}</td>
                <td>{item.rfp_title}</td>
                {actions.map((action, idx) => (
                  <td key={idx}>
                    <button
                      onClick={() =>
                        handleSeeQuery(item.RFP_No, item.rfp_title, action)
                      }
                    >
                      {action}
                    </button>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No RFP data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {visibleState.vendor && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
          <select
            style={{
              width: "80%",
              padding: "10px",
              height: "40px",
              boxSizing: "border-box",
            }}
            onChange={handleDropdownChangeVendor}
          >
            <option>Select Vendor</option>
            {vendorNames.map((vName, index) => (
              <option key={index} value={index}>
                {vName.entity_name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchSubmittedRFP}
            style={{
              padding: "10px",
              height: "40px",
              boxSizing: "border-box",
            }}
          >
            Fetch Data
          </button>
        </div>
      )}

      {visibleState.vendorquery && <VendorQuery l1= "Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle}/>}
      {visibleState.viewrfp && <RFPReqTable l1= "Super Admin" rfpNo={selectedRfpNo} action="View RFP" rfpTitle={selectedRfpTitle} />}
      {visibleState.finalrfp && <RFPVendorTable l1= "Super Admin" rfpNo={selectedRfpNo} action="Final RFP" rfpTitle={selectedRfpTitle} />}
      {visibleState.dashboard && <ScoringDashboard l1= "Super Admin" rfpNo={selectedRfpNo}  rfpTitle={selectedRfpTitle}/>}
      {visibleState.finalevaluation && <FinalEvaluation l1= "Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}
      {visibleState.submitrfp && <RFPVendorTable l1= "Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}
    </div>
  );
};

export default RFPListTable;
