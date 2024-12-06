import "./Sidebar.css";
import { AppContext } from "./../context/AppContext";
import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";

const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen, toggleSidebar }) => {
  const sidebarRef = useRef(null);
  const { userPower, userName, sidebarValue, setSidebarValue } = useContext(AppContext);

  const fetchSidebarData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({ userName, userPower });
      const response = await fetch(`/api/userItemsinSidebar?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSidebarValue(data);
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
    }
  }, [userName, userPower, setSidebarValue]);

  useEffect(() => {
    if (userPower === "User" || userPower === "Vendor User") {
      fetchSidebarData();
    }
  }, [userPower, fetchSidebarData]);

  // Sidebar configuration based on user role
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
    "Vendor Admin": [
      { label: "Add Vendor User", section: "Add Vendor User" },
      { label: "View / Modify Vendor Users", section: "View / Modify Vendor Users" },
      { label: "Assign Vendor Users", section: "Assign Vendor Users" },
      { label: "Submit Query", section: "Submit Query" },
      { label: "Submit RFP", section: "Submit RFP" },
    ],
  };

  const generateUserSidebar = (sidebarValue) => {
    if (!Array.isArray(sidebarValue) || sidebarValue.length === 0) {
      return [{ label: "No Data Available", section: null }];
    }
    const userData = sidebarValue[0];
    if (!userData.rfp_no || !Array.isArray(userData.module_name)) {
      return [{ label: "No Data Available", section: null }];
    }
    return [
      { label: `RFP No: ${userData.rfp_no}`, section: userData.rfp_no },
      ...userData.module_name.map((item, index) => ({
        label: item?.moduleName || `Module ${index + 1}`,
        section: item?.code || `Section ${index + 1}`,
      })),
      { label: "Vendor Query", section: "Vendor Query" },
    ];
  };

  const menuItems = useMemo(() => {
    if (userPower === "User" || userPower === "Vendor User") {
      return generateUserSidebar(sidebarValue || []);
    }
    return sidebarConfig[userPower] || [];
  }, [userPower, sidebarValue, sidebarConfig]);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      if (isSidebarOpen) toggleSidebar();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, toggleSidebar]);

  const handleSectionClick = (section) => {
    if (activeSection !== section) {
      setActiveSection(section);
    }
  };

  return (
    <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? "◀" : "▶"}
      </button>
      {isSidebarOpen && (
        <div>
          <h3>Welcome...</h3>
          <ul>
            {menuItems.length > 0 ? (
              menuItems.map((item, index) => (
                <li key={index} onClick={() => handleSectionClick(item.section)}>
                  {item.label}
                  {item.sublabel && (
                    <ul className="sub-label">
                      <li style={{margin:"50px"}} onClick={(e) => e.stopPropagation()}>
                        {item.sublabel}
                      </li>
                    </ul>
                  )}
                </li>
              ))
            ) : (
              <li>No Menu Items Available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
