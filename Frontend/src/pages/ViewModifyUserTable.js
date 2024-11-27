import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./../context/AppContext";
import "./ViewModifyUserTable.css";

const ViewModifyUserTable = () => {
  const { usersList, setUsersList,userName } = useContext(AppContext);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch users on component load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryParams = new URLSearchParams({ createdBy:userName });
        const response = await fetch(`/getusers?${queryParams}`); // Adjust endpoint if necessary
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsersList(data); // Update the context with fetched users
      } catch (err) {
        console.error("Error fetching users:", err.message);
      }
    };

    fetchUsers();
  }, [setUsersList]);

  const handleEdit = (user) => {
    console.log(user.user_no)
    setEditingUserId(user.user_no);
    setFormData(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData,createdBy:userName}),
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
                    <button onClick={() => handleEdit(user)}>Edit</button>
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
