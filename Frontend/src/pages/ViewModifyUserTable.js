import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./../context/AppContext";
import "./ViewModifyUserTable.css";

const ViewModifyUserTable = () => {
  const { usersList, setUsersList, userName, userPower } = useContext(AppContext);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({});
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
  // Fetch users on component load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Append the query parameter dynamically
        const queryParams = new URLSearchParams({ createdBy: userName,userPower });
        const response = await fetch(`${API_URL}/getusers?${queryParams}`); // Adjust endpoint if necessary
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to fetch users");
        }
  
        const data = await response.json();
        setUsersList(data); // Update the context with fetched users
      } catch (err) {
        console.error("Error fetching users:", err.message);
      }
    };
  
    fetchUsers();
  }, [setUsersList, userName]);
  

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
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
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
      <h2>View / Modify User</h2>
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
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <button className="save-btn" onClick={handleSave}>
                      Save
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
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
                    <button className="save-btn" onClick={() => handleEdit(user)}>Edit</button>
                    <button className="cancel-btn" onClick={() => handleDelete(user.user_no)}>Delete</button>
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
