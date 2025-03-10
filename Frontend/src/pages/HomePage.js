import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./../context/AppContext";

import RfpForm from "../components/Sections/RfpForm";
import Sidebar from "./Sidebar"; 
import AddUserForm from "./Bank_Admin/AddUserForm"; 
import VendorQuery from "./VendorQuery";
import RFPListTable from "./Vendor/RFPListTable";
import AssignUsers from "./Bank_Admin/AssignUsers";
import VendorAdmin from "./Bank_Admin/VendorAdmin";
import ViewModifyUserTable from "./Bank_Admin/ViewModifyUserTable";
import GlobalUserHome from "./GlobalAdmin/GlobalUserHome";
import ModifySuperUser from "./GlobalAdmin/ModifySuperUser";
import UploadFile from "./GlobalAdmin/UploadFile";
import Reports from "./GlobalAdmin/Reports";
import ViewAssignedRFPs from "./User/ViewAssignedRFPs"
import SubmitedRFPs from "./User/SubmitedRFPs";
import FinalEvaluation from "./Bank_Admin/FinalEvaluation.js";
import ScoringDashboard from "./Dashboard/Dashboard.js";
import RfpScoringCriteria from "../ScoringCriteria/RfpScoringCriteria";
import RFPVendorTable from "../components/RFP_Table/RFPVendorTable"
import "./combinedpages.css";
import { fetchUsers } from '../services/loadApis';
import RFPReqTable from "../components/RFP_Table/RFPReqTable";
// import {fetchUsers} from '../services/loadApis';



const CreateRFPForm = () => {
  const [formKey, setFormKey] = useState(0);

  const refreshForm = () => {
    setFormKey(prevKey => prevKey + 1); // Change key to force re-render
  };
  return (
    <RfpForm key={formKey} user="Super Admin" refresh={refreshForm} />
  );
};

const ViewRFPs = () => {
  return (
    <RFPReqTable l1="Super Admin"/>
  );
};
const SubmitRFPs = ({ action }) => {
  const { userName, userPower, setModuleData, userRole,rfpNumber } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(action);
        const queryParams = new URLSearchParams({ userName, userPower, userRole, actionName: action });

        const response = await fetch(`${API_URL}/api/getSavedData?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log(data);  // Handle the fetched data as needed
        setModuleData(data);
      } catch (error) {
        console.log("Error in Submited or View RFP Fetch: " + error);
      }
    };

    fetchData(); // Call the async function inside useEffect
  }, [action, userName, userPower, userRole, API_URL, setModuleData]); // Add necessary dependencies

  return <RFPVendorTable l1="Vendor Admin" action={action}/>;
};

const HomePage = ({ userType }) => {
  //   const [activeSection, setActiveSection] = useState("Add User");
  const [activeSection, setActiveSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { usersList, setUsersList, userName, userPower, setModuleData, userRole, rfpNumber } = useContext(AppContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // const [superUsersData, vendorsData] = await Promise.all([
        //   fetchSuperUsers(),
        //   fetchVendors(),
        fetchUsers({ setUsersList, userName, userPower });
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

  useEffect(() => {
    async function fetchArray() {
      console.log("userName " + userName)
      //23/11/2024
      try {
        const queryParams = new URLSearchParams({ userName, userPower, userRole, rfpNumber});
        let url
        if (userPower == "User") {
          // if(userRole=="Maker"){
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
          // } else{
          //   url = `${API_URL}/api/loadContents-saved?${queryParams}`;
          // }
        } else if (userPower == "Vendor User") {
          // if(userRole=="Maker"){
          //   url = `${API_URL}/api/lc-initial-vendorUser?${queryParams}`;
          // } else{
          // url = `${API_URL}/api/loadContents-saved?${queryParams}`;
          // }
          url = `${API_URL}/api/loadContents-initial?${queryParams}`;
        } else if (userPower == "Vendor Admin") {
          url = `${API_URL}/api/loadContents-superAdmin?${queryParams}`;
          //url = `${API_URL}/api/getSavedData?${queryParams}`;
        } else if (userPower == "Super Admin") {
          url = `${API_URL}/api/loadContents-superAdmin?${queryParams}`;
          // url = `${API_URL}/api/getSavedData?${queryParams}`;
        }
        console.log("Fetching URL:", url);
        const response = await fetch(url);

        console.log(response);

        // Check if the response is okay (status in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log(data);  // Handle the fetched data as needed
        setModuleData(data);
      } catch (error) {
        console.error('Error sending checked items:', error); // Log any errors
      }

    }
    fetchArray();
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  const renderSection = () => {
    console.log(activeSection);
    if (!isNaN(activeSection) && activeSection !== 99 && activeSection !== "") {
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
        return <ViewAssignedRFPs />;
      case "Submit RFP":
        return <SubmitRFPs action="Submit RFP" />;
      case "Add Vendor User":
        return <AddUserForm />;
      case "View / Modify Vendor Users":
        return <ViewModifyUserTable />
      case "Assign Vendor Users":
        return <AssignUsers />;
      case "View RFP":
        return <SubmitRFPs action="View RFP" />;
      case "Submit Query":
        return <VendorQuery rfpNo={rfpNumber} rfpTitle={"title"}/>;
     case "View Vendor Assigned RFPs":
        return <RFPVendorTable />;
      case "Vendor Query":
        return <VendorQuery />;
      // case "Vendor Query Submission":
      //   return <RFPListTable action="View Query"/>;
      // case "Final Evaluation":
      //   return <FinalEvaluation />
      case 99:
        return <RfpScoringCriteria />;
      // case "View RFPs":
      //   return <RFPListTable action="View RFP"/>;
      // case "Dashboard":
      //   return <RFPListTable action="Show Dashboard" />;
      case "View RFP Table":
        return <RFPListTable/>;
      default:
        return <p>Welcome</p>;
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
        {/* <Header /> */}
        {renderSection()}
      </div>
    </div>
  );
};

export default HomePage;
