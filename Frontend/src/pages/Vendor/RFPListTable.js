import React, { useState, useEffect, useContext } from 'react';
import "../VendorQuery.css";
import VendorQuery from '../VendorQuery';
import RFPReqTable from '../../components/RFP_Table/RFPReqTable';
import { AppContext } from "../../context/AppContext";

const RFPListTable = ({action}) => {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visibleRFP, setVisibleRFP] = useState(false);
  const [selectedRfpNo, setSelectedRfpNo] = useState(null);
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

  const handleSeeQuery = (rfpNo) => {
    setSelectedRfpNo(rfpNo); // Set the selected RFP number
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
    setVisible(!visible); // Show the VendorQuery component
   
  };
  return (
    <div className="vendor-query-container">
      <table className="vendor-query-table">
        <thead>
          <tr>
            <th>RFP No</th>
            <th>RFP Title</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.rfp_no}</td>
                <td>{item.rfp_title}</td>
                <td>
                  <button onClick={() => handleSeeQuery(item.rfp_no)}>{action}</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No RFP data available</td>
            </tr>
          )}

        </tbody>
      </table>
      {visible && action=="View Query" && <VendorQuery rfpNo={selectedRfpNo} />}
      {visibleRFP && action=="View RFP" &&<RFPReqTable l1="Super Admin" rfpNo={selectedRfpNo} /> }
    </div>
  );
};

export default RFPListTable