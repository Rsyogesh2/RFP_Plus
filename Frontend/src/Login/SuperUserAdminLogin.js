import React, { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./../context/AppContext";
import "./GlobalAdminLogin.css"; // Import the CSS file

const SuperUserAdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUserPower, setUserName } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log("yes");
    // console.log(username,password)
    e.preventDefault();

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    console.log("ok");
    const result = await response.json();
    console.log(result);
    if (response.ok) {
      alert("Login successful!");
      localStorage.setItem("token", result.token); // Store the JWT
      // Example calls to parent props or navigation logic
      onLogin("Super Admin", "credentials");
      setUserPower("Super Admin");
      setUserName(username);
      navigate("/home");
    } else {
      alert(result.message);
    }
  };


  // const [credentials, setCredentials] = useState({ username: "", password: "" });
  
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setCredentials((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onLogin("Super Admin", credentials);
  //   setUserPower("Super Admin");
  //   navigate("/home");
  // };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>SuperUser Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-footer">
            <div style={{ display: "flex", textAlign: "center" }}></div>
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperUserAdminLogin;
