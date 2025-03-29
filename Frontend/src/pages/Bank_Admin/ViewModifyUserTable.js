import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { MdOutlineModeEdit, MdDelete, MdOutlineSave,MdCancel } from "react-icons/md";

import "./../../styles/ViewModifyUserTable.css";

const ViewModifyUserTable = () => {
  const { usersList, setUsersList, userName, userPower } = useContext(AppContext);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({});
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   
  const handleEdit = (user) => {
    setEditingUserId(user.user_no);
    setFormData(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, createdBy: userName,userPower }),
      });
      if (!response.ok) throw new Error("Failed to save user");

      const updatedUsers = usersList.map((user) =>
        user.user_no === editingUserId ? { ...formData } : user
      );
      setUsersList(updatedUsers); // Update the context with updated users
      setEditingUserId(null);
      alert("User details updated!");
    } catch (err) {
      console.error("Error updating user:", err.message);
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setFormData({});
  };

  const handleDelete = async (userId) => {
    // const confirmDelete = window.confirm("Are you sure you want to delete this user?");
   
    const confirmDelete = await window.showConfirm("Are you sure?", "This action cannot be undone.", "warning");
  if (!confirmDelete) return;
  
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ createdBy: userName ,userPower}), // Include createdBy if required in the backend
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
  
      // Filter out the deleted user from the current users list
      const updatedUsers = usersList.filter((user) => user.user_no !== userId);
      setUsersList(updatedUsers); // Update the context with the new users list
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err.message);
      alert("Failed to delete the user. Please try again.");
    }
  };
  

  return (
    <div className="view-modify-table-container">
      <h4>View / Modify User</h4>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersList &&
            usersList.map((user) =>
              editingUserId === user.user_no ? (
                <tr key={user.user_no} className="editing-row">
                  <td>{user.user_no}</td>
                  <td>
                    <input
                      type="text"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <select
                      name="active_flag"
                      value={formData.active_flag}
                      onChange={handleChange}
                      className="status-badge paid"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                  <div className="button-container">
                    <button className="save-btn" style={{ fontSize: "14px" }} onClick={handleSave}>
                    <MdOutlineSave />
                    </button>
                    <button className="cancel-btn" style={{ fontSize: "14px" }} onClick={handleCancel}>
                    <MdCancel />
                    </button>

                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={user.user_no}>
                  <td>{user.user_no}</td>
                  <td>{user.user_name}</td>
                  <td>{user.designation}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td>{user.active_flag}</td>
                  <td>
                  <div className="button-container">
                    <button className="save-btn" style={{ fontSize: "14px" }} onClick={() => handleEdit(user)}><MdOutlineModeEdit /></button>
                    <button className="cancel-btn" style={{ fontSize: "14px" }} onClick={() => handleDelete(user.user_no)}><MdDelete  /></button>
                  </div>
                  </td>
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewModifyUserTable;
