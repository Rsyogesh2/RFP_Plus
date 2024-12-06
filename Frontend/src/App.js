import React, { useState ,useContext} from "react";
import { PopupManager } from './components/popup.js';
import './App.css';
import RfpForm from './components/Sections/RfpForm.js';
import RFPReqTable from './components/RFP_Table/RFPReqTable.js';
import RFPReqTable1 from './components/RFP_Table/RFPReqTable1.js';
import RfpScoringCriteria from './ScoringCriteria/RfpScoringCriteria.js';
import RFPVendorTable from './components/RFP_Table/RFPVendorTable.js';
import OTPVerification from './Login/OTPLogin.js';
import HomePage from './pages/HomePage.js';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login/GlobalAdminLogin";
// import SuperUserAdminLogin from "./Login/SuperUserAdminLogin";
// import UserLogin from "./Login/UserLogin";
import { AppProvider } from './context/AppContext';

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
          <nav>
            <ul>
            {/* {!authState.isAuthenticated && (
              <>
                <li>
                  <Link to="/login?role=Global Admin">Global Admin Login</Link>
                </li>
                <li>
                  <Link to="/login?role=Super Admin">Super User Admin Login</Link>
                </li>
                <li>
                  <Link to="/login?role=User">User Login</Link>
                </li>
              </>
            )} */}
            {authState.isAuthenticated && (
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>

        <Routes>
          {/* Dynamic Login Route */}
          <Route
            path="/"
            element={<Login onLogin={handleLogin} />}
          />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["Global Admin", "Super Admin", "User","Vendor Admin","Vendor User"]}>
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
