import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./../../context/AppContext";
import './../AssignUsers.css'
 import './../combinedpages2.css';


const AssignUsers = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [assignedUsers, setAssignedUsers] = useState([]);  // Users value Stored in the table
  const [rfpDetails, setRfpDetails] = useState([]);
  const [rfpNo, setRfpNo] = useState();
  const [rfptitle, setRfptitle] = useState();
  const [rfpModule, setRfpModule] = useState();
  const [popupVisible, setPopupVisible] = useState(false); // To show/hide the popup
  const [selectedModules, setSelectedModules] = useState([]); // To store selected modules
  const [activeTab, setActiveTab] = useState(0); // Initialize with the first tab
  const [currentUserIndex, setCurrentUserIndex] = useState(null);


  const { usersList, userName, userPower, setUsersList } = useContext(AppContext); // Users load in the table
  console.log(usersList)
  const togglePopup = (idx) => {
    console.log(idx);
    if (!rfpModule?.l1?.length) {
      alert("Please select the RFP Reference Number.");
      return false; // Prevent further execution
    }
    setCurrentUserIndex(idx);
    setSelectedModules(assignedUsers[idx]?.selectedModules || []);
    setPopupVisible((prev) => !prev);
  };
  console.log(assignedUsers)

  const handleModuleSelection = (l2module, isChecked, parentModuleName, parentL1Code) => {
    setSelectedModules((prevSelectedModules) => {
      // Find the parent module entry
      const existingModule = prevSelectedModules.find(
        (item) => item.moduleName === parentModuleName
      );

      if (isChecked) {
        // If module exists, add the l2module
        if (existingModule) {
          return prevSelectedModules.map((item) =>
            item.moduleName === parentModuleName
              ? {
                ...item,
                l2module: [...item.l2module, l2module],
              }
              : item
          );
        } else {
          // If module doesn't exist, create a new entry
          return [
            ...prevSelectedModules,
            { moduleName: parentModuleName, code: parentL1Code, l2module: [l2module] },
          ];
        }
      } else {
        // If unchecked, remove the l2module
        if (existingModule) {
          const updatedL2Modules = existingModule.l2module.filter(
            (mod) => mod !== l2module
          );

          if (updatedL2Modules.length > 0) {
            return prevSelectedModules.map((item) =>
              item.moduleName === parentModuleName
                ? { ...item, l2module: updatedL2Modules }
                : item
            );
          } else {
            // Remove the module completely if no l2modules left
            return prevSelectedModules.filter(
              (item) => item.moduleName !== parentModuleName
            );
          }
        }

        return prevSelectedModules; // No change if module doesn't exist
      }
    });
  };


  const handleSaveModules = () => {
    setAssignedUsers((prev) =>
      prev.map((user, idx) =>
        idx === currentUserIndex ? { ...user, selectedModules } : user
      )
    );
    togglePopup();
  };

  useEffect(() => {
    if (usersList && usersList.length > 0) {
      const initialAssignedUsers = usersList.map((user) => ({
        user_name: user.user_name,
        active: false,
        fromDate: "",
        toDate: "",
        maker: false,
        authorizer: false,
        reviewer: false,
        module: "",
      }));
      setAssignedUsers(initialAssignedUsers);
    }
    async function assignRFP() {
      try {
        const queryParams = new URLSearchParams({ userName });
        const response = await fetch(`${API_URL}/api/assignUsersRFPNo?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }); // Adjust the endpoint as needed
        const data = await response.json();
        console.log(data);
        setRfpDetails(data)
      } catch (error) {
        console.error('Error adding user:', error.response?.data || error.message);
      }
    }
    assignRFP()



  }, [usersList]);
  const handleFieldChange = (idx, field, value) => {
    // Update the specific user's data
    const updatedUsers = [...assignedUsers];
    updatedUsers[idx] = {
      ...updatedUsers[idx],
      [field]: value,
    };
    setAssignedUsers(updatedUsers);
    console.log(updatedUsers)
  };
  const fetchUseRfpNo = async (rfpNo) => {
    try {
      const queryParams = new URLSearchParams({ rfpNo, userName });
      const response = await fetch(`${API_URL}/api/assignRFPUserDetails?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      // console.log(data.assignedUsers[0].module_name);
      // console.log(data.modules.l1);
      console.log(data);
      setRfpNo(rfpNo);
      setRfptitle(data.rfp_title);
      setRfpModule(data.modules);
      console.log(data.assignedUsers.length)
      if (data.assignedUsers.length > 0) {
        setAssignedUsers((prev) =>
          prev.map((user) => {
            const matchingUser = data.assignedUsers.find(
              (assignedUser) => assignedUser.user_name === user.user_name
            );

            // If a match is found, merge the user object with the matching data
            return matchingUser ? { ...user, ...matchingUser } : user;
          })
        )
      }
      // setAssignedUsers(data.assignedUsers);
    } catch (error) {
      console.error("Error fetching RFP details:", error.response?.data || error.message);
    }
  };



  return (
    <div className="assign-users-container">
      <h4>Assign Users</h4>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          console.log(assignedUsers); 
          for(let user of assignedUsers){
            if(user.active){
              if(user.fromDate===""|| user.fromDate===null||user.toDate===""|| user.toDate===null){
                alert("Please select the From and To Date for the Active Users");
                return false; 
              }
            } 
          }
          console.log(rfpNo);
          try {
            // Send assigned users data to the backend
            const response = await fetch(`${API_URL}/saveassignUserModules`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ assignedUsers, rfpNo, selectedModules, userName, userPower }), // Send assignedUsers and RFP number
            });

            if (response.ok) {
              const data = await response.json();
              console.log("Data saved successfully:", data);
              alert("Users assigned successfully!");
            } else {
              const errorData = await response.json();
              console.error("Error saving data:", errorData.message);
              alert("Failed to assign users. Please try again.");
            }
          } catch (err) {
            console.error("Error:", err);
            alert("An error occurred while assigning users.");
          }
        }}
      >

        <label htmlFor="rfp-reference-no">RFP Reference No:</label>
        <select
          id="rfp-reference-no"
          onChange={(e) => fetchUseRfpNo(e.target.value)}
        >
          <option value="">Select</option>
          {rfpDetails.length > 0 &&
            rfpDetails.map((field) => (
              <option key={field.rfp_no} value={field.rfp_no}>
                {field.rfp_no}
              </option>
            ))}
        </select>

        <div className="reference-details">
          <p>{rfpNo} - {rfptitle}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Users</th>
              <th>Active</th>
              <th>From</th>
              <th>To</th>
              <th>Maker</th>
              <th>Authorizer</th>
              <th>Viewer</th>
              <th>Modules</th>
            </tr>
          </thead>
          <tbody>
            {assignedUsers &&
              assignedUsers.map((user, idx) => {
                let fromDate = user.fromDate;
                let formattedfromDate = null;
                if (fromDate) {
                  const parsedDate = new Date(fromDate);
                  console.log(parsedDate);
                  // Check if the date is valid
                  if (!isNaN(parsedDate)) {
                    // Get the year, month, and day in local time
                    const year = parsedDate.getFullYear();
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    formattedfromDate = `${year}-${month}-${day}`;
                    console.log(formattedfromDate); // Output: Correct local date
                  } else {
                    console.error('Invalid date format');
                  }
                } else {
                  console.error('Date value is empty');
                }

                let toDate = user.toDate;
                let formattedtoDate = null;
                if (toDate) {
                  const parsedDate = new Date(toDate);
                  // console.log(parsedDate);
                  // Check if the date is valid
                  if (!isNaN(parsedDate)) {
                    // Get the year, month, and day in local time
                    const year = parsedDate.getFullYear();
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    formattedtoDate = `${year}-${month}-${day}`;
                    // console.log(formattedtoDate); // Output: Correct local date
                  } else {
                    console.error('Invalid date format');
                  }
                } else {
                  console.error('Date value is empty');
                }

                //  const formattedToDate = new Date(user.toDate).toISOString().split('T')[0];
                return (
                  <tr key={idx}>
                    <td>{user.user_name}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.active}
                        onChange={(e) => handleFieldChange(idx, "active", e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={formattedfromDate || ""}
                        onChange={(e) => handleFieldChange(idx, "fromDate", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={formattedtoDate || ""}
                        onChange={(e) => handleFieldChange(idx, "toDate", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.maker}
                        onChange={(e) => handleFieldChange(idx, "maker", e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.authorizer}
                        onChange={(e) => handleFieldChange(idx, "authorizer", e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.reviewer}
                        onChange={(e) => handleFieldChange(idx, "reviewer", e.target.checked)}
                      />
                    </td>
                    <td>
                      <button type="button" onClick={() => togglePopup(idx)}>
                        {user.selectedModules?.length
                          ? user.selectedModules.map((mod) => mod.name).join(", ")
                          : "Select Modules"}
                      </button>

                      {/* Show Popup Only if rfpModule Exists */}
                      {popupVisible && currentUserIndex === idx && (
                        <div className="popup">
                          <div className="popup-content">
                            {rfpModule?.l1?.length ? (
                              <>
                                <h4>Select Modules</h4>

                                {/* Tabs for Parent Elements */}
                                <div className="tabs">
                                  {rfpModule.l1.map((module, moduleIdx) => (
                                    <span
                                      key={moduleIdx}
                                      className={`tab ${activeTab === moduleIdx ? "active" : ""}`}
                                      onClick={() => setActiveTab(moduleIdx)}
                                    >
                                      {module.name}
                                    </span>
                                  ))}
                                </div>

                                {/* Content for Selected Tab */}
                                <div className="tab-content">
                                  {rfpModule?.l1?.[activeTab]?.l2 && (
                                    <ul>
                                      {rfpModule.l1[activeTab].l2.map((l2module, l2moduleIndex) => (
                                        <li key={l2moduleIndex}>
                                          <label>
                                          <input
                                              type="checkbox"
                                              checked={selectedModules.some(
                                                (item) =>
                                                  item.code ===
                                                  rfpModule.l1[activeTab].code &&
                                                  item.l2module.some(
                                                    (mod) => mod.code === l2module.code
                                                  )
                                              )}
                                              onChange={(e) =>
                                                handleModuleSelection(
                                                  l2module,
                                                  e.target.checked,
                                                  rfpModule.l1[activeTab].name,
                                                  rfpModule.l1[activeTab].code
                                                )
                                              }
                                            />
                                            {/* <input
                                              type="checkbox"
                                              checked={selectedModules.some(
                                                (item) =>
                                                  item.moduleName ===
                                                  rfpModule.l1[activeTab].name &&
                                                  item.l2module.some(
                                                    (mod) => mod === l2module
                                                  )
                                              )}
                                              onChange={(e) =>
                                                handleModuleSelection(
                                                  l2module,
                                                  e.target.checked,
                                                  rfpModule.l1[activeTab].name,
                                                  rfpModule.l1[activeTab].code
                                                )
                                              }
                                            /> */}
                                            {l2module.name}
                                          </label>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="button-group">
                                  <button onClick={handleSaveModules}>Save</button>
                                  <button onClick={() => togglePopup()}>Cancel</button>
                                </div>
                              </>
                            ) : (
                              <p className="warning-message">Please select the RFP number.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            }
          </tbody>

        </table>
        <div style={{ textAlign: 'center' }}>
          <p></p>
          <button type="submit">SUBMIT</button>
          <button type="reset">CANCEL</button>
        </div>
      </form>


    </div>
  );
};


export default AssignUsers;
