import React, { useState, useContext } from "react";
import { AppContext } from "./../../context/AppContext";
import RFPReqTable from '../../components/RFP_Table/RFPReqTable';
import RFPVendorTable from '../../components/RFP_Table/RFPVendorTable';
import RfpForm from '../../components/Sections/RfpForm';

const ViewAssignedRFPs = (l1) => {
  const { userPower } = useContext(AppContext);


  // const fetchArray = async() =>{
  //   console.log("fetch")
  //   try {
  //     console.log("fetch")
  //     const userName = "Yogesh";
  //     const queryParams = new URLSearchParams({ userName });
  //     const response = await fetch(`/api/userAssignItems?${queryParams}`)
  //     console.log(response); 

  //     // Check if the response is okay (status in the range 200-299)
  //     if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data = await response.json(); // Parse the JSON response
  //     console.log(data); // Handle the fetched data as needed
  //     return data;
  // } catch (error) {
  //     console.error('Error sending checked items:', error); // Log any errors
  // }
  // }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%'  }}>
      {/* <RfpForm /> */}
      <div style={{ width: '100%' }}>
        {userPower === "User" ? <RFPReqTable l1={l1} /> : <RFPVendorTable l1={l1} />}
        {/* <RFPReqTable l1={l1} /> */}
        {/* <button onClick={fetchArray} >Fetch value</button> */}
      </div>
    </div>
  )
}

export default ViewAssignedRFPs