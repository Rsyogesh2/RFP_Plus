import React, { useState, useEffect } from 'react';
// import './ModifySuperUser.css';

const ModifySuperUser = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/getSuperUsers`); // Adjust API path if necessary
        if (!response.ok) {
          throw new Error('Failed to retrieve user data');
        }
        const data = await response.json();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/updateSuperUser/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updatedUser: selectedUser, // Main user details
          assignModule: selectedUser.assignModule, // Array of assigned modules
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
  
      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      setSelectedUser(null);
      console.log('User updated successfully:', updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/deleteSuperUser/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  };
  
  // Ensure formatted dates are passed
  const formattedUser = {
    ...selectedUser,
    validFrom: formatDate(selectedUser.validFrom),
    validTo: formatDate(selectedUser.validTo),
  };
  

  return (
    <div className="modify-super-user">
      <h2 className="modify-super-user__header">Users</h2>
      <table className="modify-super-user__table">
        <thead>
          <tr>
            <th>Entity Name</th>
            <th>Super User Name</th>
            <th>Active Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.entityName}</td>
              <td>{user.superUserName}</td>
              <td>{user.activeFlag}</td>
              <td>
                <button
                  className="modify-super-user__button"
                  onClick={() => handleSelectUser(user)}
                >
                  Modify
                </button>
                <button
                  className="modify-super-user__button"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="modify-super-user__form-container">
          <h3 className="modify-super-user__form-header">Modify User</h3>
          <form className="modify-super-user__form">
            <div className="modify-super-user__form-group">
              <label>Entity Name:</label>
              <input
                type="text"
                name="entityName"
                value={selectedUser.entityName}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Entity Sub Name:</label>
              <input
                type="text"
                name="entitySubName"
                value={selectedUser.entitySubName}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Entity Landline:</label>
              <input
                type="text"
                name="entityLandline"
                value={selectedUser.entityLandline}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Entity Address:</label>
              <textarea
                name="entityAddress"
                value={selectedUser.entityAddress}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="modify-super-user__form-group">
              <label>Entity City:</label>
              <input
                type="text"
                name="entityCity"
                value={selectedUser.entityCity}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Entity Pin Code:</label>
              <input
                type="text"
                name="entityPinCode"
                value={selectedUser.entityPinCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Entity Country:</label>
              <input
                type="text"
                name="entityCountry"
                value={selectedUser.entityCountry}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Super User Name:</label>
              <input
                type="text"
                name="superUserName"
                value={selectedUser.superUserName}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Designation:</label>
              <input
                type="text"
                name="designation"
                value={selectedUser.designation}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Super User Email ID:</label>
              <input
                type="email"
                name="superUserEmail"
                value={selectedUser.superUserEmail}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Super User Mobile No:</label>
              <input
                type="text"
                name="superUserMobile"
                value={selectedUser.superUserMobile}
                onChange={handleInputChange}
              />
            </div>
            <div className="modules__form-group modify-super-user__form-group">
              <label>Modules:</label>
              <span>{selectedUser.modules}</span>
            </div>
            <div className="modify-super-user__form-group">
              <label>Valid From:</label>
              <input
                type="date"
                name="validFrom"
                value={formattedUser.validFrom}
                onChange={handleInputChange}
              />
              <label>To:</label>
              <input
                type="date"
                name="validTo"
                value={formattedUser.validFrom}
                onChange={handleInputChange}
              />
            </div>
            <div className="modify-super-user__form-group">
              <label>Active Flag:</label>
              <select
                name="activeFlag"
                value={selectedUser.activeFlag}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button
              type="button"
              className="modify-super-user__submit-button"
              onClick={handleUpdate}
            >
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ModifySuperUser;
