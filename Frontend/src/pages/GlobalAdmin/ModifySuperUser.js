import React, { useState, useEffect } from 'react';
import GlobalUserHome from './GlobalUserHome';
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
  useEffect(() => {
    if (selectedUser) {
      // Perform any necessary actions with the selected user
      console.log('Selected user updated:', selectedUser);
    }
  }, [selectedUser]);
  

  const handleSelectUser = (user) => {
    setSelectedUser(null); // Clear selectedUser first
    setTimeout(() => {
      setSelectedUser(user); // Set the new user after clearing
    }, 0); // Slight delay to force re-render
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
 
  
  // Ensure formatted dates are passed
  // const formattedUser = {
  //   ...selectedUser,
  //   validFrom: formatDate(selectedUser.validFrom),
  //   validTo: formatDate(selectedUser.validTo),
  // };
  

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
      {selectedUser ? (
        <GlobalUserHome selectedUser={selectedUser} />
      ) : (
        <div className="no-selection">
          <p>Please select a user to modify.</p>
        </div>
      )}
    </div>
  );
};

export default ModifySuperUser;
