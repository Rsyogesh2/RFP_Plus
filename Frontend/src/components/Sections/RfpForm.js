// src/components/RfpForm/RfpForm.js
import React, { useRef, useState, useContext } from 'react';
import './RfpForm.css';
import InputFields from '../Forms/InputFields.js';
import FilterSections from './FilterSections';
import Button from '../Buttons/Button.js';
import ModuleList from './ModuleList.js';
import { AppContext } from '../../context/AppContext';

const RfpForm = ({ user, refresh  }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
  const childRef = useRef();
  const productRef = useRef();

  const [rfpDetails, setRfpDetails] = useState({ rfpNo: "", rfpTitle: "", modules: [] });
  const { assignModule, userName } = useContext(AppContext);
  const handleGetCheckedItems = async () => {
    let modules = [];
    let products = [];
   
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
      modules: modules[0] || [],  // Ensure safe access
      products: products[1] || [], // Ensure safe access
      userName,
    };    
    console.log(payload)
    if(rfpDetails.rfpNo===""){
      alert("Please Enter the RFP No");
      return false;
    }
    if(rfpDetails.rfpTitle=== ""){
      alert("Please Enter the RFP Title");
      return false;
    }
    // Send POST request
    const response = await fetch(`${API_URL}/api/rfpCreation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (response.ok) {
      alert("RFP succesfully created");
      refresh();
    //    // Reset form fields
    // setRfpDetails({ rfpNo: "", rfpTitle: "", modules: [] });

    // // Clear checkboxes
    // if (childRef.current) {
    //   childRef.current.clearSelection();
    // }
    // if (productRef.current) {
    //   productRef.current.clearSelection();
    // }
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
    <div className="w-full max-w-4xl  px-10 py-2 bg-white rounded-2xl  space-y-8">
    <h3>Create New RFP</h3>
  
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
      <div>
        <label className="block text-gray-700 font-medium mb-2">RFP Reference No</label>
        <input
          type="text"
          value={rfpDetails.rfpNo}
          onChange={(e) =>
            setRfpDetails((prev) => ({ ...prev, rfpNo: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">RFP Title</label>
        <input
          type="text"
          value={rfpDetails.rfpTitle}
          onChange={(e) =>
            setRfpDetails((prev) => ({ ...prev, rfpTitle: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 !m-0">
      <div>
        {/* <h3 className="text-lg font-semibold text-gray-700 mb-3">Modules</h3> */}
        <ModuleList
          title="Modules"
          url={user === "Super Admin" ? "/assignModule" : "/modules"}
          ref={childRef}
        />
      </div>
  
      {user === "Super Admin" && (
        <div>
          {/* <h3 className="text-lg font-semibold text-gray-700 mb-3">Products</h3> */}
          <ModuleList title="Products" url="/products" ref={productRef} />
        </div>
      )}
    </div>
  
    <div className="flex justify-center gap-6">
      <button
  className="px-4 py-1.5 bg-[#e6f0fb] text-[#0a5cb8] font-semibold border border-[#a3c7f5] rounded-sm hover:bg-[#d4e7fb] transition"
  onClick={handleGetCheckedItems}
>
  Submit
</button>
<button
  className="ml-8 px-4 py-1.5 bg-[#f2f2f2] text-black font-semibold rounded-sm hover:bg-[#e0e0e0] transition"
>
  Cancel
</button>

    </div>
  </div>
  
  
  );
};

export default RfpForm;
