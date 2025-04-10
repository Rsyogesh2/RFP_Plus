
import React, {useState, useContext}from "react";
import "./Navbar.css"; // Add your CSS file for styling if needed
import { AppContext } from "../../context/AppContext";
import logo from "./rfp-logo.jpeg";
       
const Navbar = ({ handleLogout }) => {
  const [isHovered, setIsHovered] = useState(false);
  let hoverTimeout;

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout); // Clear timeout if hovering again
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setIsHovered(false);
    }, 300); // Delay hiding by 300ms
  };
    const { name,userRole,userPower,sidebarValue,moduleData,setRfpNumber } = useContext(AppContext);
    const handleClearAndLogout = () => {
      setRfpNumber(""); // Clear RFP Number first
      setTimeout(() => {
        handleLogout(); // Then call logout
      }, 0); 
    };
  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        {/* Logo Section */}
        <li className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />
        </li>
        {/* Title Section */}
        <li className="navbar-center">
          <div>
            <h1 className="navbar-title">{sidebarValue[0]?.entity_name || moduleData?.entityName}</h1>
            <p className="navbar-subtitle">{userPower=="Super Admin"?"Bank Admin":userPower=="User"?"Bank User":userPower} Module</p>
          </div>
        </li>

        {/* User Info and Logout Section */}
        <li className="navbar-right">
  {/* <div className="navbar-user-container">
    <span className="navbar-username">{name } - {userPower=="Super Admin"||userPower=="Vendor Admin"?"Admin":userRole}</span>
    <span className="navbar-username"></span>
    <button className="logout-btn" onClick={handleClearAndLogout}>
      Logout
    </button>
  </div> */}
    <div
        className="profile-section"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* <img
          src="https://via.placeholder.com/40" // Replace with actual user profile image
          alt="User Profile"
          className="profile-image"
        /> */}
        <span className="username">
          {name} - {userPower === "Super Admin" || userPower === "Vendor Admin" ? "Admin" : userRole}
        </span>
        {isHovered && (
           <div className="dropdown-menu">
           <button className="logout-btn" onClick={handleClearAndLogout}>
             Logout
           </button>
         </div>
        )}
      </div>
</li>
      </ul>
    </nav>
  );
};

export default Navbar;
