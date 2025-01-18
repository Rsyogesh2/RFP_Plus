
import React, {useContext}from "react";
// import "./Navbar.css"; // Add your CSS file for styling if needed
import { AppContext } from "../../context/AppContext";
const Navbar = ({ handleLogout }) => {
    const { name,userRole,userPower } = useContext(AppContext);
      
  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        {/* Logo Section */}
        <li className="navbar-left">
          {/* <img
            src="/assets/rfp-abstract.jpg"
            alt="Logo"
            className="navbar-logo"
          /> */}
        </li>

        {/* Title Section */}
        <li className="navbar-center">
          <div>
            <h1 className="navbar-title">Axis Bank</h1>
            <p className="navbar-subtitle">Super Admin Module</p>
          </div>
        </li>

        {/* User Info and Logout Section */}
        <li className="navbar-right">
  <div className="navbar-user-container">
    {/* Username */}
    <span className="navbar-username">{name } - {userPower=="Super Admin"||userPower=="Vendor Admin"?"Admin":userRole}</span>
    <span className="navbar-username"></span>

    {/* Logout Button */}
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  </div>
</li>

      </ul>
    </nav>
  );
};

export default Navbar;
