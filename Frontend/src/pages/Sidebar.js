
import "./Sidebar.css";
import { AppContext } from "./../context/AppContext";
import React, { useEffect, useRef, useState, useContext } from "react";

const Sidebar = ({ setActiveSection, isSidebarOpen, toggleSidebar }) => {
    const sidebarRef = useRef(null);
    // const [userPower,setUserPower] = useState("Global Admin")
    const { userPower } = useContext(AppContext);
    console.log(userPower)
    const sidebarConfig = {
    "Super Admin": [
    { label: "Add User", section: "Add User" },
    { label: "View / Modify User", section: "View / Modify User" },
    { label: "Create RFP", section: "Create RFP" },
    { label: "Assign Users", section: "Assign Users" },
    { label: "Vendor Admin", section: "Vendor Admin" },
    { label: "Reports", section: "Reports" },
    ],
    "Global Admin": [
    { label: "Add Super User", section: "Add Super User" },
    { label: "Modify Super User", section: "Modify Super User" },
    { label: "Upload File", section: "Upload File" },
    { label: "Reports", section: "Reports" },
    ],
    "User": [
    { label: "View Assigned RFPs", section: "View Assigned RFPs" },
    ],
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                if (isSidebarOpen) toggleSidebar();
            }
        };

        // document.addEventListener("mousedown", handleClickOutside);

        // return () => {
        // document.removeEventListener("mousedown", handleClickOutside);
        // };
    }, [isSidebarOpen, toggleSidebar]);


    const menuItems = sidebarConfig[userPower] || [];
    return (
        <div
            ref={sidebarRef}
            className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}
        >
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isSidebarOpen ? "◀" : "▶"}
            </button>
            {isSidebarOpen && (
      <div className="sidebar">
        <h3>Welcome...</h3>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} onClick={() => setActiveSection(item.section)}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
            )
        }
        </div>
  );
};

export default Sidebar;
