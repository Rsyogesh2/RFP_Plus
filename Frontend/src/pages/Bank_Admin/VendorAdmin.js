import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import './../../styles/VendorAdmin.css';

const VendorAdmin = () => {
  // State for form inputs
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [rfpNo, setRfpNo] = useState();
  const [formData, setFormData] = useState({
    rfpReferenceNo: "",
    entityName: "",
    entitySubName: "",
    entityLandline: "",
    entityAddress: "",
    city: "",
    pinCode: "",
    country: "",
    adminName: "",
    designation: "",
    email: "",
    mobile: "",
    validFrom: "",
    validTo: "",
    activeFlag: "Active",
  });
  const [vendors, setVendors] = useState([]);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { userName, userPower } = useContext(AppContext);
  useEffect(() => {
    async function fetchVendors() {
      try {
        const queryParams = new URLSearchParams({ userName }); // Pass userName as query param
        const response = await fetch(`${API_URL}/api/vendor-list?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch vendor list");
        }

        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error("Error fetching vendors:", error.message);
      }
    }

    if (userName) {
      fetchVendors();
    }
  }, [userName]);
  useEffect(() => {
    async function assignRFP() {
      try {
        const queryParams = new URLSearchParams({ userName });
        const response = await fetch(`${API_URL}/api/assignRFPNoonly?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }); // Adjust the endpoint as needed
        const data = await response.json();
        console.log(data);
        setRfpNo(data)
      } catch (error) {
        console.error('Error adding user:', error.response?.data || error.message);
      }
    }
    assignRFP()
  }, []);
  const handleEdit = (vendor) => {
    setFormData(vendor);
    setEditingVendor(vendor);
    setShowForm(!showForm); // Toggle form visibility
  };
  //
  const handleNewVendor = () => {
    setFormData({
      rfpReferenceNo: "",
      entityName: "",
      entitySubName: "",
      entityLandline: "",
      entityAddress: "",
      city: "",
      pinCode: "",
      country: "",
      adminName: "",
      designation: "",
      email: "",
      mobile: "",
      validFrom: "",
      validTo: "",
      activeFlag: "Active",
    });
    setEditingVendor(null);
    setShowForm(!showForm); // Toggle form visibility
  };
  //  Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/vendor-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, userName, userPower }), // Send formData as JSON
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }
      setFormData({
        rfpReferenceNo: "",
        entityName: "",
        entitySubName: "",  
        entityLandline: "",
        entityAddress: "",
        city: "",
        pinCode: "",
        country: "",
        adminName: "",
        designation: "",
        email: "",
        mobile: "",
        validFrom: "",
        validTo: "",
        activeFlag: "Active",
      });


      const result = await response.json();
      alert(result.message);
      // alert("Vendor admin data saved successfully!");
    } catch (error) {
      console.error("Error saving vendor admin data:", error.message);
      alert("Failed to save data. Please try again.");
    }
  };

  return (
    <div className="vendor-admin-container">
      {/* <h4>Vendor Admin</h4> */}
      <div className="vendor-list-container">
      <h3>Vendor Admin List</h3>
      <table className="vendor-table">
        <thead>
          <tr>
            <th>RFP No</th>
            <th>Entity Name</th>
            <th>Admin Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Valid From</th>
            <th>Valid To</th>
            <th>Status</th>
            <th>Modify</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length > 0 ? (
            vendors.map((vendor, index) => (
              <tr key={index}>
                <td>{vendor.rfpReferenceNo}</td>
                <td>{vendor.entityName}</td>
                <td>{vendor.adminName}</td>
                <td>{vendor.email}</td>
                <td>{vendor.mobile}</td>
                <td>{new Date(vendor.validFrom).toLocaleDateString("en-GB")}</td>
                <td>{new Date(vendor.validTo).toLocaleDateString()}</td>
                <td>{vendor.active_flag}</td>
                <td>
                <button onClick={() => handleEdit(vendor)}>Modify</button>
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No vendors found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <button onClick={handleNewVendor} className="btn-new-vendor">New Vendor</button>
     {/* Vendor Form - Show Only When Needed */}
     <h4>{showForm && ( editingVendor ? "Edit Vendor" : "New Vendor")}</h4>

     {showForm && (
      <form onSubmit={handleSubmit}>
         
        <div className="form-group">
          <label htmlFor="rfpReferenceNo">RFP Reference No:</label>
          <select id="rfpReferenceNo" value={formData.rfpReferenceNo} onChange={handleChange} disabled={ editingVendor !== null?  true: false}>
            <option value="">Select</option>
            {Array.isArray(rfpNo) && rfpNo.length > 0 ? (
              rfpNo.map((field) => (
                <option key={field.rfp_no} value={field.rfp_no}>
                  {field.rfp_no}
                </option>
              ))
            ) : null}


            {/* Dynamically add options here */}
          </select>
        </div>

        <div className="form-group" >
          <label htmlFor="entityName">Entity Name:</label>
          <input
            id="entityName"
            type="text"
            value={formData.entityName}
            onChange={handleChange}
            disabled={ editingVendor !== null?  true: false}
          />
        </div>

        <div className="form-group">
          <label htmlFor="entitySubName">Entity Sub Name:</label>
          <input
            id="entitySubName"
            type="text"
            value={formData.entitySubName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="entityLandline">Entity Landline:</label>
          <input
            id="entityLandline"
            type="text"
            value={formData.entityLandline}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="entityAddress">Entity Address:</label>
          <textarea
            id="entityAddress"
            value={formData.entityAddress}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pinCode">Pin Code:</label>
          <input
            id="pinCode"
            type="text"
            value={formData.pinCode}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input
            id="country"
            type="text"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="adminName">Vendor Admin Name:</label>
          <input
            id="adminName"
            type="text"
            value={formData.adminName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="designation">Designation:</label>
          <input
            id="designation"
            type="text"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email ID:</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={ editingVendor !== null?  true: false}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile">Mobile No:</label>
          <input
            id="mobile"
            type="text"
            value={formData.mobile}
            onChange={handleChange}
          />
        </div>

        <div className="form-group date-group">
          <label htmlFor="validFrom">Valid From:</label>
          <input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={handleChange}
          />
        </div>

        <div className="form-group date-group">
          <label htmlFor="validTo">Valid To:</label>
          <input
            id="validTo"
            type="date"
            value={formData.validTo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="activeFlag">Active Flag:</label>
          <select id="activeFlag" value={formData.activeFlag} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-submit">SUBMIT</button>
          <button type="reset" className="btn-cancel">CANCEL</button>
        </div>
      </form>
      )}
    </div>
  );
};

export default VendorAdmin;
