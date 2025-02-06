import React, { useState, useEffect, useContext } from 'react';
import VendorQuery from '../VendorQuery';
import RFPReqTable from '../../components/RFP_Table/RFPReqTable';
import { AppContext } from "../../context/AppContext";
import ScoringDashboard from './../Dashboard';
import FinalEvaluation from '../FinalEvaluation';
import RFPVendorTable from '../../components/RFP_Table/RFPVendorTable';
import './RFPListTable.css'

const RFPListTable = ({ }) => {
  const [data, setData] = useState([]);
  const actions = ["View RFP", "Final RFP", "Submitted RFP", "Vendor Query", "Final Evaluation", "Dashboard"];
  const [actionName, setActionName] = useState();
  const [visible, setVisible] = useState(false);
  const [visibleRFP, setVisibleRFP] = useState(false);
  const [visibleSubmitRFP, setVisibleSubmitRFP] = useState(false);
  const [visibleFinalRFP, setVisibleFinalRFP] = useState(false);
  const [visibleDashboard, setVisibleDashboard] = useState(false);
  const [visibleEvaluation, setVisibleEvaluation] = useState(false);
  const [selectedRfpNo, setSelectedRfpNo] = useState(null);
  const [selectedRfpTitle, setSelectedRfpTitle] = useState(null);
  const [vendorNames, setVendorNames] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [visibleVendor, setVisibleVendor] = useState(false);
  const { moduleData, userRole, setModuleData, userName, userPower } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // const data = [
  // const data = [
  //     { rfpNo: 'RFP001', rfpTitle: 'Project Alpha' },
  //     { rfpNo: 'RFP002', rfpTitle: 'Project Beta' },
  //     { rfpNo: 'RFP003', rfpTitle: 'Project Gamma' },
  //   ];
  useEffect(() => {
    // console.log("moduledata");
    // console.log(moduleData);
    async function fetchArray() {
      const response = await fetch(`${API_URL}/fetchVendor?userName=${userName}&&rfpNo=${selectedRfpNo}`);
      const data = await response.json();
      setVendorNames(data);
    }
    fetchArray()
    if (moduleData && moduleData.rfps) {
      setData(moduleData.rfps);
    } else {
      setData([]); // Provide a fallback
    }
  }, [moduleData,selectedRfpNo]);

  const handleSeeQuery = (rfpNo, rfpTitle, actionName) => {
    console.log(actionName)
    
    if (actionName === "Submitted RFP") {
      setVisibleDashboard(false)
      setVisibleEvaluation(false);
      setVisibleFinalRFP(false);
      setVisible(false);
      setVisibleSubmitRFP(false);
      setVisibleRFP(false);
      setVisibleVendor(!visibleVendor)
      if(visibleVendor){
        setActionName(actionName);
        setSelectedRfpNo(rfpNo); // Set the selected RFP number
        setSelectedRfpTitle(rfpTitle);

        async function fetchArray() {
          const response = await fetch(`${API_URL}/fetchVendor?userName=${userName}&&rfpNo=${rfpNo}`);
          const data = await response.json();
          setVendorNames(data);
        }
        fetchArray()
        return false;
      } else {
        rfpNo=selectedRfpNo;
        actionName="Submitted RFP";
        async function fetchArray() {
          const response = await fetch(`${API_URL}/fetchVendor?userName=${userName}&&rfpNo=${rfpNo}`);
          const data = await response.json();
          setVendorNames(data);
        }
        fetchArray()
      }
     
    } else{
      setActionName(actionName);
      setSelectedRfpNo(rfpNo); // Set the selected RFP number
      setSelectedRfpTitle(rfpTitle);
    }
    async function fetchArray() {
      console.log("userName " + userName)
      //23/11/2024
      try {
        const queryParams = new URLSearchParams({ userName, userPower, userRole, rfpNo: rfpNo, actionName });
        let url
        if (userPower === "User") {
          // if(userRole=="Maker"){
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
          // } else{
          //   url = `${API_URL}/api/loadContents-saved?${queryParams}`;
          // }
        } else if (userPower === "Vendor User") {
          // if(userRole=="Maker"){
          //   url = `${API_URL}/api/lc-initial-vendorUser?${queryParams}`;
          // } else{
          // url = `${API_URL}/api/loadContents-saved?${queryParams}`;
          // }
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
        } else if (userPower === "Vendor Admin") {
          url = `${API_URL}/api/getSavedData?${queryParams}`;
        } else if (userPower === "Super Admin") {
          url = `${API_URL}/api/getSavedData?${queryParams}`;
        }
        console.log("Fetching URL:", url);
        const response = await fetch(url);

        console.log(response);

        // Check if the response is okay (status in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log(data);  // Handle the fetched data as needed
        console.log(moduleData);  // Handle the fetched data as needed
        setModuleData(prevState => {
          const updatedData = { ...prevState, ...data };
          console.log("Updated instantly:", updatedData);
          return updatedData;
        });

      } catch (error) {
        console.error('Error sending checked items:', error); // Log any errors
      }

    }
    fetchArray();
    if (actionName === "Dashboard") {
      setVisibleVendor(false);
      // if(visibleVendor){
      setVisibleDashboard(!visibleDashboard)
      setVisibleEvaluation(false);
      setVisibleFinalRFP(false);
      setVisible(false);
      setVisibleSubmitRFP(false);
      setVisibleRFP(false);
      // }
    } else if (actionName === "Final Evaluation") {
      setVisibleVendor(false);
      // if(visibleVendor){
      setVisibleDashboard(false)
      setVisible(false);
      setVisibleEvaluation(!visibleEvaluation)
      setVisibleFinalRFP(false)
      setVisibleSubmitRFP(false);
      setVisibleRFP(false);
      // }
    } else if (actionName === "Vendor Query") {
      setVisibleVendor(false);
      // if(visibleVendor){
      setVisible(!visible); // Show the VendorQuery component
      setVisibleDashboard(false)
      setVisibleEvaluation(false);
      setVisibleFinalRFP(false)
      setVisibleSubmitRFP(false);
      setVisibleRFP(false);
      // }
    } else if (actionName === "View RFP") {
      setVisibleVendor(false);
      setVisibleDashboard(false)
      setVisibleEvaluation(false)
      setVisibleFinalRFP(false)
      setVisible(false);
      setVisibleSubmitRFP(false);
      setVisibleRFP(!visibleRFP);
    } else if (actionName === "Final RFP") {
      setVisibleVendor(false);
      setVisibleFinalRFP(!visibleFinalRFP)
      setVisible(false); // Show the VendorQuery component
      setVisibleDashboard(false)
      setVisibleEvaluation(false);
      setVisibleSubmitRFP(false);
      setVisibleRFP(false);
    } else if (actionName === "Submitted RFP") {
      
    }
  };

  // Handle Dropdown Change
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
const fetchSubmittedRFP = async() => {

    const queryParams = new URLSearchParams({ userName, userPower, userRole, rfpNo: selectedRfpNo,selectedVendor:selectedVendor.id, actionName:"Submitted RFP" });
    let url
    if (userPower === "Super Admin") {
      url = `${API_URL}/api/getSavedData?${queryParams}`;
    }
    console.log("Fetching URL:", url);
    const response = await fetch(url);

    console.log(response);

    // Check if the response is okay (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // Parse the JSON response
    console.log(data);  // Handle the fetched data as needed
    console.log(moduleData);  // Handle the fetched data as needed
    
      // setVisibleFinalRFP(false)
      // setVisible(false); // Show the VendorQuery component
      // setVisibleDashboard(false);
      // setVisibleEvaluation(false);
      // setVisibleRFP(false);
       setVisibleSubmitRFP(!visibleSubmitRFP);

    setModuleData(prevState => {
      const updatedData = { ...prevState, ...data };
      console.log("Updated instantly:", updatedData);
      return updatedData;
    });

   
}



  return (
    <div className="vendor-query-container">
      <table className="vendor-query-table">
        <thead className='rfptablelist-header'>
          <tr>
            <th>RFP No</th>
            <th>RFP Title</th>
            {actions.map((actionName) => (<th>Action</th>))}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.RFP_No}</td>
                <td>{item.rfp_title}</td>
                {actions.map((action, index1) => (
                  <td key={index1}><button onClick={() => handleSeeQuery(item.RFP_No, item.rfp_title, action)}>
                    {action}</button></td>))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No RFP data available</td>
            </tr>
          )}
        </tbody>
      </table>
      {
        visibleVendor &&

        <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
          <select
            style={{
              width: "80%",
              padding: "10px",
              height: "40px",
              boxSizing: "border-box"
            }}
            onChange={handleDropdownChangeVendor}
          >
            <option>Select Vendor</option>
            {vendorNames && vendorNames.map((vName, index) => (
              <option key={index} value={index}>{vName.entity_name}</option>
            ))}
          </select>
          <button
            onClick={fetchSubmittedRFP}
            style={{
              padding: "10px",
              height: "40px",
              boxSizing: "border-box"
            }}
          >
            Fetch Data
          </button>
        </div>

      }
      {visible && actionName === "Vendor Query" && <VendorQuery rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}
      {visibleRFP && actionName === "View RFP" && <RFPReqTable l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} action={"View RFP"} />}
      {visibleFinalRFP && actionName === "Final RFP" && <RFPVendorTable l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} action={"Final RFP"} />}
      {visibleDashboard && actionName === "Dashboard" && <ScoringDashboard l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}
      {visibleEvaluation && actionName === "Final Evaluation" && <FinalEvaluation l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}
      {visibleSubmitRFP && actionName === "Submitted RFP" && <RFPVendorTable l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} />}
    </div>
  );
};

export default RFPListTable