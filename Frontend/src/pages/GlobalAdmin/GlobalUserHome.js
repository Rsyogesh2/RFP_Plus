import React, { useRef, useState, useContext } from 'react';
import RfpForm from '../../components/Sections/RfpForm';
import './AddSuperUser.css';
import './UserManagement.css';

import './../../components/Sections/RfpForm.css'
import ModuleList from '../../components/Sections/ModuleList';
import { AppContext } from '../../context/AppContext';
import { showPopup } from '../../components/popup';


const GlobalUserHome = ({ selectedUser }) => {
  const childRef = useRef();

  const handleGetCheckedItems = async () => {
    if (childRef.current) {
      const checkedItems = await childRef.current.getCheckedItems("RFPAssignedtoSuperUser");
      console.log("Checked Items in GlobalUserHome:", checkedItems); // Debug log
      return checkedItems; // Return the checked items
    }
    return [];
  };

  return (
    <div id="GlobalAdmin-Home">
      <div className="column column-large">
        {/* <RfpForm user="Global Admin" /> */}
        <ModuleList title="Modules" url="/modules" ref={childRef} />
        {/* <div className="button-group">
                    <button className='btn'text="Submit" onClick={handleGetCheckedItems}>Submit</button>
                    <button className='btn' text="Cancel">Cancel</button>
                </div> */}
      </div>
      <div className="column column-small">
        {/* <VendorAdmin /> */}
        {/* <AddUser handleGetCheckedItems={handleGetCheckedItems} /> */}
        <AddUser
          handleGetCheckedItems={handleGetCheckedItems}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  )
}

export default GlobalUserHome


const AddUser = ({ handleGetCheckedItems, selectedUser  }) => {
  // const [newUser, setNewUser] = useState({
  //   entityName: '',
  //   entitySubName: '',
  //   entityLandline: '',
  //   entityAddress: '',
  //   entityCity: '',
  //   entityPinCode: '',
  //   entityCountry: '',
  //   superUserName: '',
  //   designation: '',
  //   superUserEmail: '',
  //   superUserMobile: '',
  //   validFrom: '',
  //   validTo: '',
  //   activeFlag: 'Active',
  // });
  const [newUser, setNewUser] = useState({
    entityName: selectedUser?.entityName || '',
    entitySubName: selectedUser?.entitySubName || '',
    entityLandline: selectedUser?.entityLandline || '',
    entityAddress: selectedUser?.entityAddress || '',
    entityCity: selectedUser?.entityCity || '',
    entityPinCode: selectedUser?.entityPinCode || '',
    entityCountry: selectedUser?.entityCountry || '',
    superUserName: selectedUser?.superUserName || '',
    designation: selectedUser?.designation || '',
    superUserEmail: selectedUser?.superUserEmail || '',
    superUserMobile: selectedUser?.superUserMobile || '',
    validFrom: selectedUser?.validFrom || '',
    validTo: selectedUser?.validTo || '',
    activeFlag: selectedUser?.activeFlag || 'Active',
  });

  const { assignModule } = useContext(AppContext);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };
  const handleSubmit = async () => {
    // Await the result of handleGetCheckedItems
    const subItems = await handleGetCheckedItems();
    console.log("SubItems in handleSubmit:", subItems); // Debug log
    if (subItems.length > 0) {
      // Pass subItems directly to handleAddUser
      await handleAddUser(subItems);
    } else {
      showPopup('Global Alert', 'No items selected!')
    }
  };


  const handleAddUser = async (subItems) => {
    console.log('New User Data', newUser);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      console.log(subItems)

      const response = await fetch(`${API_URL}/addOrUpdateSuperUser`, {
        method: 'POST', // Use POST method
        headers: {
          'Content-Type': 'application/json', // Specify the content type
        },
        body: JSON.stringify({ newUser, assignModule }), // Convert checkedItems to JSON
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      alert("User Created successfully")
    } catch (error) {
      console.error('Error adding user:', error.response?.data || error.message);
    }
    // Add logic to send new user data to the backend
  };
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  };

  return (
    <div className="add-user-container">
       <h3>{selectedUser ? 'Modify User' : 'Add New User'}</h3>
       <form>
        <div className="form-group">
          <label>Entity Name:</label>
          <input
            type="text"
            name="entityName"
            value={newUser.entityName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Entity Sub Name:</label>
          <input
            type="text"
            name="entitySubName"
            value={newUser.entitySubName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Entity Landline:</label>
          <input
            type="text"
            name="entityLandline"
            value={newUser.entityLandline}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Entity Address:</label>
          <textarea
            name="entityAddress"
            value={newUser.entityAddress}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="form-group">
          <label>Entity City:</label>
          <input
            type="text"
            name="entityCity"
            value={newUser.entityCity}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Entity Pin Code:</label>
          <input
            type="text"
            name="entityPinCode"
            value={newUser.entityPinCode}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Entity Country:</label>
          <input
            type="text"
            name="entityCountry"
            value={newUser.entityCountry}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Super User Name:</label>
          <input
            type="text"
            name="superUserName"
            value={newUser.superUserName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Designation:</label>
          <input
            type="text"
            name="designation"
            value={newUser.designation}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Super User Email ID:</label>
          <input
            type="email"
            name="superUserEmail"
            value={newUser.superUserEmail}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Super User Mobile No:</label>
          <input
            type="text"
            name="superUserMobile"
            value={newUser.superUserMobile}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Valid From:</label>
          <input
            type="date"
            name="validFrom"
            value={formatDate(newUser.validFrom)}
            onChange={handleInputChange}
          />
          <label>To:</label>
          <input
            type="date"
            name="validTo"
            value={formatDate(newUser.validTo)}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Active Flag:</label>
          <select
            name="activeFlag"
            value={newUser.activeFlag}
            onChange={handleInputChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button type="button" onClick={handleSubmit}>
          {selectedUser ? 'Update User' : 'Add User'}
        </button>
      </form>

    </div>
  );
};

