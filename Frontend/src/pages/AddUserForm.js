
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./../context/AppContext";
import './AddUserForm.css'

const AddUserForm = () => {
  const { usersList, setUsersList, userName, userPower } = useContext(AppContext);
  console.log(usersList);
  const [id, setId] = useState(1);
  const [formData, setFormData] = useState(() => {
    const nextUserNo = usersList.length > 0 
        ? Math.max(...usersList.map(user => user.user_no)) + 1 
        : 1;

    return {
        user_no: nextUserNo,
        user_name: "",
        designation: "",
        email: "",
        mobile: "",
        activeFlag: "Active",
    };
});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_URL}/addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,       // Spread the formData fields into the object
          emailId: userName,  // Add the userName (or emailid) field separately
          userPower
        }), // Convert the form data to JSON
      });

      if (response.ok) {

        // Increment the local ID
        const data = await response.json();
        if (data.success) {
          // Update global state with the new user
          setUsersList([...usersList, { ...formData }]);
          alert('User added successfully!');
          const no = Number(usersList.length) == 0 ? 2 : usersList.length + 1;
          // Clear the form fields by resetting formData
          setFormData({
            user_no:  usersList.length > 0 
            ? Math.max(...usersList.map(user => user.user_no)) + 1 
            : 1,
            user_name: "",
            designation: "",
            email: "",
            mobile: "",
            activeFlag: "Active", // Reset to default value

          });
          // setId(usersList.length+2);
        } else {
          alert('Failed to add user. Please try again.');
        }
      } else {
        alert('Failed to connect to the server. Please try again.');
      }
    } catch (error) {
      console.error('Error adding user:', error.message);
      alert('An error occurred while adding the user.');
    }
  };



  return (
    <div className="add-user-form">
      <h3>Add User</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>User:</label>
          <span style={{ textAlign: "left" }}>{ usersList.length > 0 
              ? Math.max(...usersList.map(user => user.user_no)) + 1 
              : 1}</span>
        </div>
        <div>
          <label>User Name:</label>
          <input
            type="text"
            name="user_name"
            placeholder="Enter user name"
            value={formData.user_name} // Bind to formData
            onChange={handleChange} // Update formData on change
          />
        </div>
        <div>
          <label>Designation:</label>
          <input
            type="text"
            name="designation"
            placeholder="Enter designation"
            value={formData.designation} // Bind to formData
            onChange={handleChange}
          />
        </div>
        <div>
          <label>User Email ID:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email} // Bind to formData
            onChange={handleChange}
          />
        </div>
        <div>
          <label>User Mobile No:</label>
          <input
            type="tel"
            name="mobile"
            placeholder="Enter mobile number"
            value={formData.mobile} // Bind to formData
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Active Flag:</label>
          <select
            name="activeFlag"
            value={formData.activeFlag} // Bind to formData
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="buttons">
          <button type="submit">Submit</button>
          <button
            type="button"
            onClick={() => setFormData({
              user_no:  usersList.length > 0 
              ? Math.max(...usersList.map(user => user.user_no)) + 1 
              : 1,
              user_name: "",
              designation: "",
              email: "",
              mobile: "",
              activeFlag: "Active",
            })}
          >
            Cancel
          </button>

        </div>
      </form>

    </div>
  );
};


export default AddUserForm;