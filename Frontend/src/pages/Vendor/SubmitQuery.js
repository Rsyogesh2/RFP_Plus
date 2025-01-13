import React, { useState, useEffect, useContext } from 'react';
import "../VendorQuery.css";
import VendorQuery from '../VendorQuery';
import { AppContext } from "../../context/AppContext";

const SubmitQuery = () => {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedRfpNo, setSelectedRfpNo] = useState(null);
  const { moduleData, userRole } = useContext(AppContext);

  // const data = [
  //     { rfpNo: 'RFP001', rfpTitle: 'Project Alpha' },
  //     { rfpNo: 'RFP002', rfpTitle: 'Project Beta' },
  //     { rfpNo: 'RFP003', rfpTitle: 'Project Gamma' },
  //   ];
  useEffect(() => {
    if (moduleData && moduleData.rfps) {
      setData(moduleData.rfps);
    } else {
      setData([]); // Provide a fallback
    }
  }, [moduleData]);

  const handleSeeQuery = (rfpNo) => {
    setSelectedRfpNo(rfpNo); // Set the selected RFP number
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
                  <button onClick={() => handleSeeQuery(item.rfp_no)}>See Query</button>
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
      {visible && <VendorQuery rfpNo={selectedRfpNo} />}
    </div>
  );
};

export default SubmitQuery