import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./../context/AppContext";
import './AssignUsers.css'


const AssignUsers = () => {
  const [assignedUsers, setAssignedUsers] = useState([]);  // Users value Stored in the table
  const [rfpDetails, setRfpDetails] = useState([]);
  const [rfpNo, setRfpNo] = useState();
  const [rfpModule, setRfpModule] = useState();
  const [popupVisible, setPopupVisible] = useState(false); // To show/hide the popup
  const [selectedModules, setSelectedModules] = useState([]); // To store selected modules
  const [activeTab, setActiveTab] = useState(0); // Initialize with the first tab
  const [currentUserIndex, setCurrentUserIndex] = useState(null);


  const { usersList, userName,setUsersList } = useContext(AppContext); // Users load in the table
  console.log(usersList)
  const togglePopup = (idx) => {
    setCurrentUserIndex(idx);
    setSelectedModules(assignedUsers[idx]?.selectedModules || []);
    setPopupVisible((prev) => !prev);
  };

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
        const response = await fetch(`/api/assignUsersRFP?${queryParams}`, {
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
      const queryParams = new URLSearchParams({ rfpNo });
      const response = await fetch(`/api/assignRFPUserDetails?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
  
      setRfpNo(rfpNo);
      setRfpModule(data.modules);
      setAssignedUsers((prev) =>
        prev.map((user) => {
          const matchingUser = data.assignedUsers.find(
            (assignedUser) => assignedUser.user_name === user.user_name
          );
      
          // If a match is found, merge the user object with the matching data
          return matchingUser ? { ...user, ...matchingUser } : user;
        })
      );
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
          console.log(rfpNo);
          try {
            // Send assigned users data to the backend
            const response = await fetch("/assignUserModules", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ assignedUsers, rfpNo, selectedModules,userName }), // Send assignedUsers and RFP number
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
          {rfpDetails &&
            rfpDetails.map((field) => (
              <option key={field.rfp_no} value={field.rfp_no}>
                {field.rfp_no}
              </option>
            ))}
        </select>

        <div className="reference-details">
          <p>&lt;{rfpNo}&gt; - &lt;{"title"}&gt;</p>
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
              <th>Reviewer</th>
              <th>Modules</th>
            </tr>
          </thead>
          <tbody>
            {assignedUsers &&
              assignedUsers.map((user, idx) => (
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
                      value={user.fromDate || ""}
                      onChange={(e) => handleFieldChange(idx, "fromDate", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={user.toDate || ""}
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
                    {popupVisible && currentUserIndex === idx && (
                      <div className="popup">
                        <div className="popup-content">
                          <h4>Select Modules</h4>

                          {/* Tabs for Parent Elements */}
                          <div className="tabs">
                            {rfpModule &&
                              rfpModule.l1.map((module, moduleIdx) => (
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
                            {rfpModule.l1[activeTab]?.l2 && (
                           <ul>
                           {rfpModule.l1[activeTab].l2.map((l2module, l2moduleIndex) => (
                             <li key={l2moduleIndex}>
                               <label>
                                 <input
                                   type="checkbox"
                                   checked={selectedModules.some(
                                     (item) =>
                                       item.moduleName === rfpModule.l1[activeTab].name &&
                                       item.l2module.some((mod) => mod === l2module)
                                   )}
                                   onChange={(e) =>
                                     handleModuleSelection(
                                       l2module,
                                       e.target.checked,
                                       rfpModule.l1[activeTab].name,
                                       rfpModule.l1[activeTab].code // Pass L1_Code here
                                     )
                                   }
                                 />
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
                            <button onClick={togglePopup}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
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