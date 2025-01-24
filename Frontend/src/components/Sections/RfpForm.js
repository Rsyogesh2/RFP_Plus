// src/components/RfpForm/RfpForm.js
import React, { useRef, useState, useContext } from 'react';
import './RfpForm.css';
import InputFields from '../Forms/InputFields.js';
import FilterSections from './FilterSections';
import Button from '../Buttons/Button.js';
import ModuleList from './ModuleList.js';
import { AppContext } from '../../context/AppContext';

const RfpForm = ({ user }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
  const childRef = useRef();
  const productRef = useRef();

  const [rfpDetails, setRfpDetails] = useState({ rfpNo: "", rfpTitle: "", modules: [] });
  const { assignModule, userName } = useContext(AppContext);
  const handleGetCheckedItems = async () => {
    let modules = [];
    let products = [];
    if(rfpDetails.rfpNo===""){
      alert("Please Enter the RFP No");
      return false;
    }
    if(rfpDetails.rfpTitle=== ""){
      alert("Please Enter the RFP Title");
      return false;
    }
    // Fetch checked items for modules
    if (childRef.current) {
      modules = childRef.current.getCheckedItems("RFPCreation");
    }
  
    // Fetch checked items for products if the user is "Super Admin"
    if (user === "Super Admin" && productRef.current) {
      products = productRef.current.getCheckedItems("RFPCreation");
    }
  
    // Prepare the request payload
    const payload = {
      rfpDetails,
      modules,
      products,
      userName,
    };
  
    // Send POST request
    const response = await fetch(`${API_URL}/api/rfpCreation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (response.ok) {
      alert("RFP Created");
    } else {
      alert("RFP Not Created, Duplicate RFP Creation");
    }
  };
  
  // const handleGetCheckedItems = async () => {
  //   // console.log("childRef.current")
  //   let module;
  //   console.log(childRef.current)
  //   if (childRef.current) {
  //     module = childRef.current.getCheckedItems("RFPCreation");
  //     alert(module);
  //   }
  //   const response = await fetch("/api/rfpCreation", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ rfpDetails, module, userName }),
  //   });
  //   if (response.ok) {
  //     alert("RFP Created");
  //   } else {
  //     alert("RFP Not Created, Duplicate RFP Creation");
  //   }

  // };
  const just = () => {
    console.log("childRef.current");
  };

  return (
    <div className="rfp-form">
      <h2 style={{ textAlign: 'center' }}>Create New RFP</h2>
      <div className="input-group">
        <div className="input-field" id="input1no">
          <label>RFP Reference No</label>
          <input type="text" value={rfpDetails.rfpNo}
            onChange={(e) =>
              setRfpDetails((prevState) => ({
                ...prevState,
                rfpNo: e.target.value,
              }))
            } />
        </div>
        <div className="input-field" id="input1title">
          <label>RFP Title</label>
          <input type="text" value={rfpDetails.rfpTitle}
            onChange={(e) =>
              setRfpDetails((prevState) => ({
                ...prevState,
                rfpTitle: e.target.value,
              }))
            } />
        </div>
      </div>
      {/* <FilterSections/> */}
      <div className="checkbox-group">
        {/* <CheckboxList title="Modules" items={modules} />
      <CheckboxList title="Products" items={products} />
      <CheckboxList title="RFP Response Options" items={responseOptions} /> */}
        {/* <CheckboxList title="Modules" items={modules} />
        <CheckboxList title="Products" items={products} />
        <CheckboxList title="RFP Response Options" items={responseOptions} />       */}
        {user === "Super Admin" ? <ModuleList title="Modules" url="/assignModule" ref={childRef} />
          : <ModuleList title="Modules" url="/modules" ref={childRef} />}

        {user === "Super Admin" && (
          <ModuleList title="Products" url="/products" ref={productRef} />
        )}
        {/* <ModuleList title="RFP Response Options" /> */}
      </div>

      <div className="button-group" style={{ textAlign: 'center' }}>
        <button className='btn' text="Submit" onClick={handleGetCheckedItems}>Submit</button>
        <button className='btn' text="Cancel">Cancel</button>
      </div>
    </div>
  );
};

export default RfpForm;
