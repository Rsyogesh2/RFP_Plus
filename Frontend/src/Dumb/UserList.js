// src/components/UserList.js
import React, { useEffect, useState } from 'react';

const UserList = () => {
    const [users, setUsers] = useState([]);

  // src/components/UserList.js
useEffect(() => {
    // No need to specify http://localhost:5000 since the proxy handles it
    fetch('/api')
        .then(response => response.json())
        .then(data => setUsers(data))
        .catch(error => console.error('Error fetching users:', error));
}, []);


    return (
        <div>
            <h1>User List</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
