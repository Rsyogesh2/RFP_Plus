import React, { useState, useContext } from "react";
import { AppContext } from "./../context/AppContext";

import RfpForm from "../components/Sections/RfpForm";
import Sidebar from "./Sidebar";
import VendorQuery from "./VendorQuery";
import AssignUsers from "./AssignUsers";
import VendorAdmin from "./VendorAdmin";
import ViewModifyUserTable from "./ViewModifyUserTable";
import GlobalUserHome from "./GlobalAdmin/GlobalUserHome";
import ModifySuperUser from "./GlobalAdmin/ModifySuperUser";
import UploadFile from "./GlobalAdmin/UploadFile";
import Reports from "./GlobalAdmin/Reports";
import ViewAssignedRFPs from "./User/ViewAssignedRFPs"
import SubmitedRFPs from "./User/SubmitedRFPs";
import FinalEvaluation from "./FinalEvaluation";
import RfpScoringCriteria from "../ScoringCriteria/RfpScoringCriteria";
import RFPVendorTable from "../components/RFP_Table/RFPVendorTable"
import "./HomePage.css";
import {fetchUsers} from '../services/loadApis';
import {fetchUsers} from '../services/loadApis';


const Header = () => {
  const { userPower } = useContext(AppContext);

  return (
    <div className="header">
      <h1>{ }</h1>
      <h2>{`${userPower} Module`}</h2>
    </div>
  );
};


const AddUserForm = () => {
  const { usersList, setUsersList, userName, userPower } = useContext(AppContext);
  // console.log(userName);
  const [id, setId] = useState(1);
  const [formData, setFormData] = useState({
    id: usersList.length + 1,
    userName: "",
    designation: "",
    email: "",
    mobile: "",
    activeFlag: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${API_URL}/addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,       // Spread the formData fields into the object
          emailId: userName,  // Add the userName (or emailid) field separately
          userPower
        }), // Convert the form data to JSON
      });

      if (response.ok) {

        // Increment the local ID
        const data = await response.json();
        if (data.success) {
          // Update global state with the new user
          setUsersList([...usersList, { ...formData }]);
          alert('User added successfully!');
          const no = Number(usersList.length) == 0 ? 2 : usersList.length + 1;
          // Clear the form fields by resetting formData
          setFormData({
            id: no,
            userName: "",
            designation: "",
            email: "",
            mobile: "",
            activeFlag: "Active", // Reset to default value

          });
          // setId(usersList.length+2);
        } else {
          alert('Failed to add user. Please try again.');
        }
      } else {
        alert('Failed to connect to the server. Please try again.');
      }
    } catch (error) {
      console.error('Error adding user:', error.message);
      alert('An error occurred while adding the user.');
    }
  };



  return (
    <div className="add-user-form">
      <h3>Add User</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>User:</label>
          <span style={{ textAlign: "left" }}>{usersList.length + 1}</span>
        </div>
        <div>
          <label>User Name:</label>
          <input
            type="text"
            name="userName"
            placeholder="Enter user name"
            value={formData.userName} // Bind to formData
            onChange={handleChange} // Update formData on change
          />
        </div>
        <div>
          <label>Designation:</label>
          <input
            type="text"
            name="designation"
            placeholder="Enter designation"
            value={formData.designation} // Bind to formData
            onChange={handleChange}
          />
        </div>
        <div>
          <label>User Email ID:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email} // Bind to formData
            onChange={handleChange}
          />
        </div>
        <div>
          <label>User Mobile No:</label>
          <input
            type="tel"
            name="mobile"
            placeholder="Enter mobile number"
            value={formData.mobile} // Bind to formData
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Active Flag:</label>
          <select
            name="activeFlag"
            value={formData.activeFlag} // Bind to formData
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="buttons">
          <button type="submit">Submit</button>
          <button type="button">Cancel</button>
          <button type="button">Next &gt;&gt;</button>
        </div>
      </form>

    </div>
  );
};



const CreateRFPForm = () => {
  return (
    <RfpForm user="Super Admin" />
  );
};

const HomePage = ({ userType }) => {
  //   const [activeSection, setActiveSection] = useState("Add User");
  const [activeSection, setActiveSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // const [superUsersData, vendorsData] = await Promise.all([
        //   fetchSuperUsers(),
        //   fetchVendors(),
        fetchUsers();
        // ]);
        // setSuperUsers(superUsersData);
        // setVendors(vendorsData);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  
  const renderSection = () => {
    console.log(activeSection);
    if (!isNaN(activeSection)) {
      // Call the ViewAssignedRFPs component with the activeSection as a prop
      return <ViewAssignedRFPs l1module={activeSection} />;
    }
    switch (activeSection) {
      case "Add User":
        return <AddUserForm />;
      case "Create RFP":
        return <CreateRFPForm />;
      case "Assign Users":
        return <AssignUsers />;
      case "Vendor Admin":
        return <VendorAdmin />;
      case "View / Modify User":
        return <ViewModifyUserTable />
      case "Add Super User":
        return <GlobalUserHome />;
      case "Modify Super User":
        return <ModifySuperUser />;
      case "Upload File":
        return <UploadFile />;
      case "Reports":
        return <Reports />;
      case "View Assigned RFPs":
        return <ViewAssignedRFPs  />;
      case "Submit RFPs":
        return <SubmitedRFPs />;
      case "Add Vendor User":
        return <AddUserForm />;
      case "View / Modify Vendor Users":
        return <ViewModifyUserTable />
      case "Assign Vendor Users":
        return <AssignUsers />;
      case "Submit Query":
        return <RfpScoringCriteria />;
      case "Submit RFP":
        // return <CreateRFPForm />;
      case "View Vendor Assigned RFPs":
          return <RFPVendorTable />;
      case "Vendor Query":
        return <VendorQuery />;
      case "Final Evaluation":
        return <FinalEvaluation />
      default:
        return <p>Select an option from the sidebar.</p>;
    }
  };
  return (
    <div className="HomePage-container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`main-content ${isSidebarOpen ? "with-sidebar" : "full-screen"}`}
      >
        <Header />
        {renderSection()}
      </div>
    </div>
  );
};

export default HomePage;
