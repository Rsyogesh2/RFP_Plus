import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./../context/AppContext";
import "./GlobalAdminLogin.css";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const { setUserPower, setUserName } = useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in with credentials:", credentials);

    const response = await fetch(`/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    console.log("Login response:", result);

    if (response.ok) {
      alert("Login successful!");
      localStorage.setItem("token", result.token); // Store the JWT
      setUserName(credentials.username);

      // Fetch roles for the user
      const rolesResponse = await fetch(`/api/get-roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: credentials.username }),
      });

      const rolesResult = await rolesResponse.json();
      console.log("Roles response:", rolesResult);

      if (rolesResponse.ok) {
        setRoles(rolesResult.roles);
        alert("Please select your role to proceed.");
      } else {
        alert(rolesResult.message || "Failed to fetch roles.");
      }
    } else {
      alert(result.message);
    }
  };

  const handleRoleSelect = (e) => {
    setSelectedRole(e.target.value);
    setUserPower(e.target.value); // Set the selected role in context
  };

  const handleNavigateToHome = () => {
    if (!selectedRole) {
      // alert("Please select a role first.");
      return;
    }
    onLogin(selectedRole)
    navigate("/home");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        {roles.length > 0 && (
          <div className="role-selection">
            <label htmlFor="role">Select Role:</label>
            <select id="role" value={selectedRole} onChange={handleRoleSelect}>
              <option value="" disabled>
                -- Select a Role --
              </option>
              {roles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button onClick={handleNavigateToHome()} className="home-button">
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
