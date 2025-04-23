import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./../context/AppContext";
import "./GlobalAdminLogin.css";
import logo from "../assets/rfp-logo.jpeg";
import ForgotPassword from './ForgotPassword'; // Import the Forgot Password component
// import { showToast } from "./../components/utils/PopupService";
// import { ToastContainer } from "react-toastify";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [roles, setRoles] = useState([]);
  const [rfpnumbers, setRfpnumbers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const { setUserPower, setUserName, setUserRole, setName, rfpNumber, setRfpNumber } = useContext(AppContext);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null); // Track selected index

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true); // Show the Forgot Password component
  };
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in with credentials:", credentials);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    console.log("Login response:", result);

    if (response.ok) {
      if (credentials.username == "GlobalUser") {
        console.log(result.Name.active_flag);
        if (result.Name.active_flag === "Inactive") {
          console.log("Condition passed! Now showing popup...");
          window.showPopup("Success!", "User is Inactive!", "success");
          return
        }
      }
      if (result.Name.active_flag === "Inactive") {
        console.log("Condition passed! Now showing popup...");
        window.showPopup("Success!", "Your credentials are disabled, please contact your Administrator", "success");
        return
      }
      window.showPopup("Success!", "Login successful!", "success")
      localStorage.setItem("token", result.token); // Store the JWT
      setUserName(credentials.username);
      if (credentials.username == "GlobalUser") {
        setName("GlobalUser");
      } else if (credentials.username == "AdminUser") {
        setName("AdminUser");
      } else {
        setName(result.Name.user_name);
      }
      // Fetch roles for the user
      const rolesResponse = await fetch(`${API_URL}/api/get-roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: credentials.username }),
      });

      const rolesResult = await rolesResponse.json();
      console.log("Roles response:", rolesResult);

      if (rolesResponse.ok) {
        if (rolesResult.roles[0] === "User" || rolesResult.roles[0] === "Vendor User") {

          let rolesPer = [];
          let rpfnos = [];
          for (let rfps of rolesResult.results1) {
            if (rfps.isMaker == 1) {
              rolesPer.push(`${rolesResult.roles} - Maker`)
            } else if (rfps.isAuthorizer == 1) {
              rolesPer.push(`${rolesResult.roles} - Authorizer`)
            } else {
              rolesPer.push(`${rolesResult.roles} - Reviewer`)
            }
            rpfnos.push(rfps.rfpNo);
          }

          if (rolesPer.length === 0) {
            setRoles(rolesResult.roles);
          } else {
            console.log(rolesPer)
            setRoles(rolesPer);
          }
          if (rpfnos.length === 0) {

          } else {
            console.log(rpfnos)
            setRfpnumbers(rpfnos);
          }
        } else {
          console.log(rolesResult.roles);
          if (rolesResult.roles[0] === "Super Admin") {
            // setRoles(rolesResult.roles);

          } else if (rolesResult.roles[0] === "Vendor Admin") {
            setRfpnumbers([rolesResult.results1[0].rfpNo]);
          }
          setRoles(rolesResult.roles);
        }


      } else {
        alert(rolesResult.message || "Failed to fetch roles.");
      }
    } else {
      alert(result.message);
    }
  };
  const handleRoleSelect = (e) => {
    console.log(e.target.value);
    let val = e.target.value.includes(" - ") ? e.target.value.split(" - ") : [e.target.value, ""];

    setSelectedRole(val[0]);
    setUserPower(val[0]); // Set the selected role in context
    setUserRole(val[1] || ""); // Prevent undefined
  };

  const handleRFPSelect = (event) => {
    const index = event.target.selectedIndex - 1; // Get index (excluding disabled option)
    setRfpNumber(event.target.value);
    setSelectedIndex(index >= 0 ? index : null); // Update selected index

    if (index >= 0 && index < roles.length) {
      setSelectedRole(roles[index]);
      handleRoleSelect({ target: { value: roles[index] } }); // Pass a mock event with value
    }
  };


  const handleNavigateToHome = () => {
    if (!selectedRole && !rfpNumber) {
      // alert("Please select a role first.");
      return;
    }
    onLogin(selectedRole)
    navigate("/home");
  };

  return (
    <div className="login-page">
      {!showForgotPassword ? (
        <div className="login-container">
           <div className="login-left">
    <div className="welcome-content">
      <h2>Welcome to</h2>
      <img src={logo} alt="RFP Manage Logo" className="rfp-logo" />
    </div>
  </div>
  <div className="login-right">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address <span className="required">*</span></label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="login-options">
              <label>
                <input type="checkbox" name="rememberMe" />
                Remember Me
              </label>
              <a href="#" className="forgot-password" onClick={handleForgotPasswordClick} >Forgot Password?</a>
            </div>
            <button
              className="login-btn"
              style={{
                margin: "0px",
                backgroundColor: "#bf6620",
              }}
            >
              LOGIN
            </button>

          </form>

          {roles.length > 0 && (
            <div className="role-selection">
              {/* First Dropdown (RFP No) */}
              {/* First Dropdown (RFP No) */}
              <label htmlFor="rfpNo" style={{ display: (roles[0] !== "Super Admin" && roles[0] !== "Vendor Admin") ? "block" : "none" }}>
                Select RFP No:
              </label>
              <select
                id="rfpNo"
                value={rfpNumber}
                onChange={handleRFPSelect}
                style={{ display: (roles[0] !== "Super Admin" && roles[0] !== "Vendor Admin") ? "block" : "none" }}
                className="text-center border p-2 rounded"
              >
                <option value="" className="text-center">-- Select RFP No --</option>
                {rfpnumbers.map((role, index) => (
                  <option key={index} value={role}>{role === "Super Admin" ? "Bank Admin" : role}</option>
                ))}
              </select>

              {/* Second Dropdown (Role) */}
              <label htmlFor="role" style={{ display: (roles[0] === "Super Admin" || roles[0] === "Vendor Admin" || roles[0] === "Global Admin") ? "block" : "none" }}>
                Select Role:
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={handleRoleSelect}
                style={{ display: (roles[0] === "Super Admin" || roles[0] === "Vendor Admin" || roles[0] === "Global Admin") ? "block" : "none" }}
                className="text-center border p-2 rounded"
              >
                <option value="" className="text-center">--- Select a Role ---</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>
                    {role === "Super Admin" ? "Bank Admin" : role}
                  </option>
                ))}
              </select>
              <button onClick={handleNavigateToHome} className="home-btn" style={{ marginLeft: "0px", marginRight: "0px" }}>Go to Home</button>
            </div>
          )}
        </div>
        </div>
      ) : (
        <ForgotPassword /> // Show the Forgot Password component
      )}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default Login;
