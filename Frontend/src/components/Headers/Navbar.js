
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
    const handlePasswordChange = () => {
      // Logic to handle password change
      console.log("Change Password clicked");
    }
  return (
    <nav className="flex items-center justify-between px-6 py-2 shadow bg-white">
    {/* Logo Section */}
    <div className="flex items-center space-x-2 w-1/3">
      <img src={logo} alt="Logo" className="h-10 w-auto" />
    </div>
  
    {/* Bank Info Section */}
    <div className="text-center w-1/3">
      <h1 className="text-blue-800 font-bold text-sm">
        {sidebarValue[0]?.entity_name || moduleData?.entityName}
      </h1>
      <p className="text-blue-600 italic text-xs">
        RFP No: {sidebarValue[0]?.rfp_name} <br />
        Vendor: {sidebarValue[0]?.vendor_name}
      </p>
    </div>
  
    {/* User Info Section */}
    <div className="text-right text-sm w-1/3">
      <p className="text-blue-800 font-semibold">{name} </p>
      <p className="text-blue-800 font-semibold">  {userPower === "Super Admin" ? "Bank Admin" : userPower === "Vendor Admin" ? "Vendor Admin" : userRole}</p>
      <p className="text-xs italic">
        <span
          className="text-orange-700 cursor-pointer mr-1"
          onClick={handlePasswordChange}
        >
          Change Password
        </span>
        |
        <span
          className="text-orange-700 cursor-pointer ml-1"
          onClick={handleClearAndLogout}
        >
          Logout
        </span>
      </p>
    </div>
  </nav>
  
  );
};

export default Navbar;
