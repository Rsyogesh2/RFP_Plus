import React, { useState, useContext, useEffect } from "react";
import { PopupManager } from './components/popup.js';
import './App.css';
import RfpForm from './components/Sections/RfpForm.js';
import RFPReqTable from './components/RFP_Table/RFPReqTable.js';
import Navbar from './components/Headers/Navbar.js';
import RfpScoringCriteria from './ScoringCriteria/RfpScoringCriteria.js';
import RFPVendorTable from './components/RFP_Table/RFPVendorTable.js';
import OTPVerification from './Login/OTPLogin.js';
import HomePage from './pages/HomePage.js';
import Header from './components/Headers/Header.js';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate  } from "react-router-dom";
import Login from "./Login/GlobalAdminLogin";
// import SuperUserAdminLogin from "./Login/SuperUserAdminLogin";
// import UserLogin from "./Login/UserLogin";
import { AppProvider } from './context/AppContext';
import ResetPassword from "./Login/ResetPassword"; // Reset password component
import ActivateAccount from "./Login/ActivateAccount.js";
import LoginResetForm from "./Login/LoginResetForm.js"; // Reset password component
// import { ToastContainer } from "react-toastify";
import { GlobalAlertProvider } from "./context/GlobalAlertContext.js";

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userType: null, // Could be "GlobalAdmin", "SuperUserAdmin", or "User"
  });
// const navigate = useNavigate();

  const handleLogin = (userType, credentials) => {
    console.log(`${userType} logged in`);
    setAuthState({ isAuthenticated: true, userType });
    return <Navigate to="/home" />;
  };

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/hello`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => console.log('Response from backend:', data))
      .catch((error) => console.error('Error during fetch:', error));
  }, []);
  const handleLogout = () => {
    window.location.reload();
    // setAuthState({ isAuthenticated: false, userType: null });
  };
  const handleChangePassword = (userName) => {
    console.log("Change Password clicked in App.js");
    // setAuthState({ isAuthenticated: false, userType: null });
   window.location.href = `/reset-password?email=${userName}`;
    // return <Navigate to="/#" />; // ✅ correct usage
  };
  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    return authState.isAuthenticated && allowedRoles.includes(authState.userType)
      ? children
      : <Navigate to="/" />;
  };


  return (
    <AppProvider>
      <PopupManager>
      <GlobalAlertProvider>
        <Router>
          <div>
          {authState.isAuthenticated && (
              <Navbar  handleLogout={handleLogout} handleChangePassword={handleChangePassword} />
            )}
            <Routes>
              {/* Dynamic Login Route */}
              <Route
                path="/"
                element={<Login onLogin={handleLogin} />}
              />
              <Route path="/reset-password" element={<ResetPassword />} /> {/* Reset Password Page */}
              <Route path="/activate-account" element={<ResetPassword />} /> {/* Reset Password Page */}
               {/* <Route path="/activate-account" element={<ActivateAccount />} /> Reset Password Page */}
              {/* <Route path="/activate-account" element={<LoginResetForm />} /> Reset Password Page */}
           
              {/* Protected Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute allowedRoles={["Global Admin", "Super Admin", "User", "Vendor Admin", "Vendor User"]}>
                    <HomePage authState={authState.userType} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfp-form"
                element={
                  <ProtectedRoute>
                    <RfpForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfp-req-table"
                element={
                  <ProtectedRoute>
                    <RFPReqTable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfp-scoring-criteria"
                element={
                  <ProtectedRoute>
                    <RfpScoringCriteria />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfp-vendor-table"
                element={
                  <ProtectedRoute>
                    <RFPVendorTable />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
        </GlobalAlertProvider>
      </PopupManager>
    </AppProvider>
  );
}

export default App;
