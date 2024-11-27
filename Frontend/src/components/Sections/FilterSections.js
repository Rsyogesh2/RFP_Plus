// src/components/RfpForm/Sections.js
import React, { useState, useEffect } from 'react';
import './RfpForm.css';
import CheckboxList from './CheckboxList';
import ModuleList from './ModuleList.js';

const FilterSections = () => {
  // const [modules, setModules] = useState([0]);
  // const [products, setProducts] = useState([0]);
  // const [responseOptions, setResponseOptions] = useState([0]);

  // // Fetch data from the backend
  // useEffect(() => {
  //   // Replace these URLs with the actual API endpoints
  //   fetch('api/modules')
  //     .then(response => response.json())
  //     .then(data => setModules(data))
  //     .catch(error => console.error("Error fetching modules:", error));

  //   fetch('api/products')
  //     .then(response => response.json())
  //     .then(data => setProducts(data))
  //     .catch(error => console.error("Error fetching products:", error));

  //   fetch('api/response-options')
  //     .then(response => response.json())
  //     .then(data => setResponseOptions(data))
  //     .catch(error => console.error("Error fetching response options:", error));
  // }, []);

  // const modules = [
  //   'Customer Initiation', 'Lead Management', 'Customer Onboarding', 'KYC/CYQC Process', 
  //   'Customer Relationship Management', 'Mobile Onboarding', 'Portal Onboarding', 
  //   'Field Onboarding', 'Loan Origination System', 'Core Banking Solutions', 
  //   'Loan Management Services', 'Payments', 'Horizontal Services'
  // ];
  // const products = [
  //   'Savings Account Opening', 'Current Account Opening', 'Fixed Deposits Opening', 
  //   'Recurring Deposits Opening', 'Overdraft Opening', 'Personal Loans', 
  //   'Gold / Jewel Loans', 'Pre-approved PL (STP)', 'Vehicle Loan', 'SME', 'Agri', 'Corporate'
  // ];
  // const responseOptions = [
  //   'Available', 'Partly Available', 'Customizable', 'Not Available', 'Mandatory / Optional'
  // ];

  return (
    <div className="checkbox-group">
      {/* <CheckboxList title="Modules" items={modules} />
      <CheckboxList title="Products" items={products} />
      <CheckboxList title="RFP Response Options" items={responseOptions} /> */}
       {/* <CheckboxList title="Modules" items={modules} />
        <CheckboxList title="Products" items={products} />
        <CheckboxList title="RFP Response Options" items={responseOptions} />       */}

        {/* <ModuleList title="Modules" url="/modules"/>
        <ModuleList title="Products" url="/products" />
        <ModuleList title="RFP Response Options"/> */}
    </div>
  );
};

export default FilterSections;
