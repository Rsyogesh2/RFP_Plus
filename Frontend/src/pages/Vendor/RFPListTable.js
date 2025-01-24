import React, { useState, useEffect, useContext } from 'react';
import "../VendorQuery.css";
import VendorQuery from '../VendorQuery';
import RFPReqTable from '../../components/RFP_Table/RFPReqTable';
import { AppContext } from "../../context/AppContext";
import ScoringDashboard from './../Dashboard';
import FinalEvaluation from '../FinalEvaluation';
import RFPVendorTable from '../../components/RFP_Table/RFPVendorTable';

const RFPListTable = ({}) => {
  const [data, setData] = useState([]);
  const actions= ["View RFPs","Final RFPs","Vendor Query Submission","Final Evaluation","Dashboard"];
  const [actionName, setActionName] = useState();
  const [visible, setVisible] = useState(false);
  const [visibleRFP, setVisibleRFP] = useState(false);
  const [visibleFinalRFP, setVisibleFinalRFP] = useState(false);
  const [visibleDashboard, setVisibleDashboard] = useState(false);
  const [visibleEvaluation, setVisibleEvaluation] = useState(false);
  const [selectedRfpNo, setSelectedRfpNo] = useState(null);
  const [selectedRfpTitle, setSelectedRfpTitle] = useState(null);
  const { moduleData, userRole, setModuleData, userName, userPower } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // const data = [
  //     { rfpNo: 'RFP001', rfpTitle: 'Project Alpha' },
  //     { rfpNo: 'RFP002', rfpTitle: 'Project Beta' },
  //     { rfpNo: 'RFP003', rfpTitle: 'Project Gamma' },
  //   ];
  useEffect(() => {
    // console.log("moduledata");
    // console.log(moduleData);
    if (moduleData && moduleData.rfps) {
      setData(moduleData.rfps);
    } else {
      setData([]); // Provide a fallback
    }
  }, [moduleData]);

  const handleSeeQuery = (rfpNo,rfpTitle,actionName) => {
    console.log(actionName)
    setActionName(actionName);
    setSelectedRfpNo(rfpNo); // Set the selected RFP number
    setSelectedRfpTitle(rfpTitle)
    async function fetchArray() {
      console.log("userName " + userName)
      //23/11/2024
      try {
        const queryParams = new URLSearchParams({ userName, userPower, userRole, rfpNo:rfpNo });
        let url
        if (userPower == "User") {
          // if(userRole=="Maker"){
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
          // } else{
          //   url = `${API_URL}/api/loadContents-saved?${queryParams}`;
          // }
        } else if (userPower == "Vendor User") {
          // if(userRole=="Maker"){
          //   url = `${API_URL}/api/lc-initial-vendorUser?${queryParams}`;
          // } else{
          // url = `${API_URL}/api/loadContents-saved?${queryParams}`;
          // }
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
        } else if (userPower == "Vendor Admin") {
          url = `${API_URL}/api/getSavedData?${queryParams}`;
        } else if (userPower == "Super Admin") {
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
      setVisibleRFP(!visibleRFP);
      } catch (error) {
        console.error('Error sending checked items:', error); // Log any errors
      }

    }
    fetchArray();
    if(actionName==="Dashboard"){
      setVisibleDashboard(!visibleDashboard)
      setVisibleEvaluation(false)
      setVisible(false);
    } else if(actionName==="Final Evaluation"){
      setVisibleDashboard(false)
      setVisible(false);
      setVisibleEvaluation(!visibleEvaluation)
    } else if(actionName==="Vendor Query Submission"){
      setVisible(!visible); // Show the VendorQuery component
      setVisibleDashboard(false)
      setVisibleEvaluation(false)
    } else if(actionName==="Final RFPs"){
      setVisibleFinalRFP(!visibleFinalRFP)
      setVisible(false); // Show the VendorQuery component
      setVisibleDashboard(false)
      setVisibleEvaluation(false)
    }
    
    
  };
  return (
    <div className="vendor-query-container">
      <table className="vendor-query-table">
        <thead>
          <tr>
            <th>RFP No</th>
            <th>RFP Title</th>
            {actions.map((actionName)=>(<th>Action</th>))}
                  
            
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.RFP_No}</td>
                <td>{item.rfp_title}</td>
                  {actions.map((action,index1)=>(
                    <td key={index1}><button onClick={() => handleSeeQuery(item.RFP_No,item.rfp_title,action)}>
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
      {visible && actionName=="Vendor Query Submission" && <VendorQuery rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle}/>}
      {visibleRFP && actionName=="View RFPs" &&<RFPReqTable l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle} /> }
      {visibleDashboard && actionName=="Dashboard" &&<ScoringDashboard l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle}/> }
      {visibleEvaluation && actionName=="Final Evaluation" &&<FinalEvaluation l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle}/> }
      {visibleFinalRFP && actionName=="Final RFPs" &&<RFPVendorTable l1="Super Admin" rfpNo={selectedRfpNo} rfpTitle={selectedRfpTitle}/> }
    </div>
  );
};

export default RFPListTable