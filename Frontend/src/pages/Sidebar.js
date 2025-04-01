import "./combinedpages.css";
import { AppContext } from "./../context/AppContext";
import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";
import { FaUserPlus, FaUsersCog, FaFileAlt, FaUserTag, FaUserShield, FaChartLine, FaTable } from "react-icons/fa";

const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen, toggleSidebar }) => {
  const sidebarRef = useRef(null);
  const { userPower, userName, sidebarValue, setSidebarValue,userRole, rfpNumber } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
  const fetchSidebarData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({ userName, userPower,userRole,rfpNumber });
      const response = await fetch(`${API_URL}/api/userItemsinSidebar?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log(data)
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
      { label: "Add User", section: "Add User", icon: <FaUserPlus /> },
      { label: "View / Modify User", section: "View / Modify User", icon: <FaUsersCog /> },
      { label: "Create RFP", section: "Create RFP", icon: <FaFileAlt /> },
      { label: "Assign Users", section: "Assign Users", icon: <FaUserTag /> },
      { label: "Vendor Admin", section: "Vendor Admin", icon: <FaUserShield /> },
      // { label: "Reports", section: "Reports", icon: <FaChartLine /> },
      { label: "View RFP Table", section: "View RFP Table", icon: <FaTable /> },
    ], // { label: "View RFPs", section: "View RFPs" },
      // { label: "Vendor Query Submission", section: "Vendor Query Submission" },
      // { label: "Final Evaluation", section: "Final Evaluation" },
      // { label: "Dashboard", section: "Dashboard" },
      
    // ],
    "Global Admin": [
      { label: "Add Super User", section: "Add Super User", icon: <FaUserPlus /> },
      { label: "Modify Super User", section: "Modify Super User", icon: <FaUsersCog />  },
      { label: "Upload File", section: "Upload File" },
      { label: "Reports", section: "Reports" },
    ],
    "Vendor Admin": [
      { label: "Add Vendor User", section: "Add Vendor User", icon: <FaUserPlus /> },
      { label: "View / Modify Vendor Users", section: "View / Modify Vendor Users", icon: <FaUsersCog />  },
      { label: "Assign Vendor Users", section: "Assign Vendor Users", icon: <FaUserTag /> },
      // { label: "View RFP", section: "View RFP" },
      // { label: "Submit Query", section: "Submit Query" },
      // { label: "Submit RFP", section: "Submit RFP" },
      { label: "View RFP Table", section: "View RFP Table", icon: <FaTable /> },
    ],
  };

  // const generateUserSidebar = (sidebarValue) => {
  //   if (!Array.isArray(sidebarValue) || sidebarValue.length === 0) {
  //     return [{ label: "No Data Available", section: null, subItems: [] }];
  //   }

  //   // Group each RFP and its modules
  //   return sidebarValue.map((userData, userIndex) => {
  //     if (!userData.rfp_no || !Array.isArray(userData.module_name)) {
  //       return { label: `No Data Available for User ${userIndex + 1}`, subItems: [] };
  //     }

  //     return {
  //       label: `RFP No: ${userData.rfp_no}`, // Main title
  //       section: userData.rfp_no,
  //       subItems: [
  //         ...userData.module_name.map((item, index) => ({
  //           sublabel: item?.moduleName || `Module ${index + 1}`,
  //           section: item?.code || `Section ${index + 1}`,
  //         })),
  //         { sublabel: "Vendor Query", section: "Vendor Query" }, // Add Vendor Query at the end
  //       ],
  //     };
  //   });
  // };


  // const menuItems = useMemo(() => {
  //   if (userPower === "User" || userPower === "Vendor User") {
  //     return generateUserSidebar(sidebarValue || []);
  //   }
  //   return sidebarConfig[userPower] || [];
  // }, [userPower, sidebarValue, sidebarConfig]);

  const generateUserSidebar = (sidebarValue, userPower) => {
    if (!Array.isArray(sidebarValue) || sidebarValue.length === 0) {
      return [{ label: "No Data Available", section: null, subItems: [] }];
    }
  
    // Group each RFP and its modules
    return sidebarValue.map((userData, userIndex) => {
      if (!userData.rfp_no || !Array.isArray(userData.module_name)) {
        return { label: `No Data Available for User ${userIndex + 1}`, subItems: [] };
      }
  
      const subItems = [
        ...userData.module_name.map((item, index) => ({
          sublabel: item?.moduleName || `Module ${index + 1}`,
          section: item?.code || `Section ${index + 1}`,
        })),
      ];
  
      // Add "Vendor Query" if userPower is "Vendor User"
      if (userPower === "Vendor User" || userPower === "User") {
        subItems.push({ sublabel: "Vendor Query", section: "Vendor Query" });
      }
  
      return {
        label: `RFP No: ${userData.rfp_no}`, // Main title
        section: userData.rfp_no,
        subItems,
      };
    });
  };
  
  const menuItems = useMemo(() => {
    if (userPower === "User" || userPower === "Vendor User") {
      return generateUserSidebar(sidebarValue || [], userPower);
    }
    return sidebarConfig[userPower] || [];
  }, [userPower, sidebarValue, sidebarConfig]);
  
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      if (isSidebarOpen) toggleSidebar();
    }
  };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [isSidebarOpen, toggleSidebar]);

  const handleSectionClick = (section) => {
    console.log("setActiveSection" +section)
    if (activeSection !== section) {
      console.log("setActiveSection")
      setActiveSection(section);
    }
  };
  // const groupedMenuItems = menuItems.reduce((acc, item) => {
  //   if (item.label) {
  //     // Start a new group for main titles
  //     acc.push({ label: item.label, subItems: [] });
  //   } else if (item.sublabel && acc.length > 0) {
  //     // Add subtitle to the most recent group
  //     acc[acc.length - 1].subItems.push(item.sublabel);
  //   }
  //   return acc;
  // }, []);
  // console.log(menuItems);
  // console.log(groupedMenuItems);
  return (
    <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? "◀" : "▶"}
      </button>
      {isSidebarOpen && (
        <div>
         
          <ul>
            {menuItems.length > 0 ? (
              menuItems.map((item, index) => (
                <li key={index}>
                  <div className="sidebar-mainlabel" id={`sidebar-mainlabel-${index}`}
                   onClick={() => {
                    if (userPower !== "User" && userPower !== "Vendor User") {
                      handleSectionClick(item.section)}
                    }
                    }>
                      <span className="sidebar-icon">{item.icon && item.icon}</span>
                      <span className="sidebar-label">{item.label}</span>
                      </div>
                  {item.subItems?.length > 0 && (
                    <ul className="nested-sub-label">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex} className="sidebar-sublabel" onClick={() => handleSectionClick(subItem.section)}>
                          {subItem.sublabel}
                        </li>
                      ))}
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
