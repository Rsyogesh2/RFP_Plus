

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
export const fetchUsers = async ({setUsersList,userName,userPower}) => {
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
