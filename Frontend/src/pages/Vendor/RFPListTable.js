import React, { useState, useEffect, useContext } from "react";
import VendorQuery from "../VendorQuery";
import RFPReqTable from "../../components/RFP_Table/RFPReqTable";
import { AppContext } from "../../context/AppContext";
import ScoringDashboard from "../Dashboard/Dashboard.js";
import FinalEvaluation from "../Bank_Admin/FinalEvaluation.js";
import RFPVendorTable from "../../components/RFP_Table/RFPVendorTable";
import "./RFPListTable.css";

const RFPListTable = () => {
  let actions = [
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
  actions = userPower === "Vendor Admin"
    ? actions.filter(action => !["Final Evaluation", "Dashboard", "Final RFP"].includes(action))
      // .concat("Submit RFP") // Add "Submit RFP"
    : actions; // Keep all actions for other user roles

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


    if (action === "Submitted RFP" && userPower === "Super Admin") {
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
    } else if (action === "Submitted RFP" && userPower === "Vendor Admin") {
      setVisibleState((prev) => ({
        vendor: false,
        viewrfp: false,
        submitrfp: !prev.submitrfp,
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
      if (action == "View RFP" || action == "Final RFP" || action == "Sumbitted RFP") {
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
    <div className="vendor-query-container1">
      <h3>View RFP Table</h3>
     <div style={{ overflowX: '10px', marginBottom: '20px' }}>
  <table
    style={{
      width: '100%',
      minWidth: '800px',
      borderCollapse: 'collapse',
    }}
  >
    <thead>
      <tr>
        <th
          style={{
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '1px solid #ccc',
          }}
        >
          RFP No
        </th>
        <th
          style={{
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '1px solid #ccc',
          }}
        >
          RFP Title
        </th>
        {actions.map((action, idx) => (
          <th
            key={idx}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1px solid #ccc',
            }}
          >
            
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? (
        data.map((item, index) => (
          <tr key={index}>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
              {item.RFP_No}
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
              {item.rfp_title}
            </td>
            {actions.map((action, idx) => (
              <td
                key={idx}
                style={{ padding: '8px 8px', borderBottom: '1px solid #eee' }}
              >
                <button
                  style={{
                    padding: '6px 6px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f8faff',
                    cursor: 'pointer',
                    color: '#325496',
                  }}
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
          <td
            colSpan="3"
            style={{
              padding: '10px',
              textAlign: 'center',
              borderBottom: '1px solid #ccc',
            }}
          >
            No RFP data available
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {visibleState.vendor && userPower === "Super Admin" && (
       <div className="flex flex-wrap items-center gap-4 mb-4 px-5">

    {/* Vendor Dropdown */}
    <select
        onChange={handleDropdownChangeVendor}
        className="w-full md:w-72 p-2.5 border border-gray-300 rounded-md text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F4F8B] focus:border-[#2F4F8B] shadow-sm"
    >
        <option value="">Select Vendor</option>
        {vendorNames.map((vName, index) => (
            <option key={index} value={index}>
                {vName.entity_name}
            </option>
        ))}
    </select>

    {/* Fetch Button */}
    <button
        onClick={fetchSubmittedRFP}
        className="px-6 py-2.5 bg-[#2F4F8B] text-white text-sm font-semibold rounded-md shadow hover:bg-[#1e3669] transition"
    >
        Fetch Data
    </button>

</div>

      )}

      {visibleState.vendorquery && <VendorQuery l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}

      {visibleState.viewrfp && (
        userPower === "Super Admin"
          ? <RFPReqTable l1="Super Admin" rfpNo={selectedRfpNo} action="View RFP" rfpTitle={selectedRfpTitle} />
          : <RFPVendorTable l1="Vendor Admin" rfpNo={selectedRfpNo} action="View RFP" rfpTitle={selectedRfpTitle} />
      )}

      {visibleState.finalrfp && <RFPVendorTable l1={userPower} rfpNo={selectedRfpNo} action="Final RFP" rfpTitle={selectedRfpTitle} />}

      {visibleState.dashboard && <ScoringDashboard l1={userPower} rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}

      {visibleState.finalevaluation && <FinalEvaluation l1={userPower} rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}

      {visibleState.submitrfp && (
        userPower === "Super Admin"
          ? <RFPVendorTable l1="Super Admin" rfpNo={selectedRfpNo} action="Submit RFP" rfpTitle={selectedRfpTitle} />
          : <RFPVendorTable l1="Vendor Admin" action="Submit RFP" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />
      )}
    </div>
  );
};

export default RFPListTable;
