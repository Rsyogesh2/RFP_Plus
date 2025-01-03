import React, {useState,useEffect,useContext} from 'react';
import "../VendorQuery.css";
import VendorQuery from '../VendorQuery';
import { AppContext } from "../../context/AppContext";

const SubmitQuery = () => {
    const [data,setData] = useState([]);
    const [visible,setVisible] = useState(false);
    const [selectedRfpNo, setSelectedRfpNo] = useState(null);
    const { moduleData, userRole } = useContext(AppContext);
     
    // const data = [
    //     { rfpNo: 'RFP001', rfpTitle: 'Project Alpha' },
    //     { rfpNo: 'RFP002', rfpTitle: 'Project Beta' },
    //     { rfpNo: 'RFP003', rfpTitle: 'Project Gamma' },
    //   ];
    useEffect(() => {
        setData(moduleData.rfps);
    },[])
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
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.rfp_no}</td>
              <td>{item.rfp_title}</td>
              <td>
                <button onClick={() => handleSeeQuery(item.rfp_no)}>See Query</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible && <VendorQuery rfpNo={selectedRfpNo} />}
      </div>
    );
  };

export default SubmitQuery