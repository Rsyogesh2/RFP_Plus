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
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login/GlobalAdminLogin";
// import SuperUserAdminLogin from "./Login/SuperUserAdminLogin";
// import UserLogin from "./Login/UserLogin";
import { AppProvider } from './context/AppContext';
import ResetPassword from "./Login/ResetPassword"; // Reset password component


function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userType: null, // Could be "GlobalAdmin", "SuperUserAdmin", or "User"
  });
  

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
    setAuthState({ isAuthenticated: false, userType: null });
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
        <Router>
          <div>
          {authState.isAuthenticated && (
              <Navbar  handleLogout={handleLogout} />
            )}
            <Routes>
              {/* Dynamic Login Route */}
              <Route
                path="/"
                element={<Login onLogin={handleLogin} />}
              />
              <Route path="/reset-password" element={<ResetPassword />} /> {/* Reset Password Page */}
           
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
      </PopupManager>
    </AppProvider>
  );
}

export default App;
