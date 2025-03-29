import React, { createContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

// Create Context (not necessary to export)
const GlobalAlertContext = createContext();

// Provider Component
export const GlobalAlertProvider = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  // Global Toast Function
  const showToast = (message, type = "success") => {
    setToastVisible(true);
    toast[type](message, {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
  };

  // Global Popup Function
  const showPopup = (title, text, icon = "info") => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: "OK",
      background: "#ffffff", // White background
      color: "#222", // Dark text
      confirmButtonColor: "#0d6efd", // Blue confirm button (Bootstrap primary color)
      iconColor: "#0d6efd", // Blue icon color
       width: "400px",
      customClass: {
        popup: "custom-popup",
      },
    });
  };

  const showConfirm = (title, text, icon = "warning") => {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      background: "#ffffff",
      color: "#222",
      confirmButtonColor: "#dc3545", // Red confirm button (Bootstrap danger color)
      cancelButtonColor: "#6c757d", // Grey cancel button
      iconColor: "#dc3545", // Red warning icon
      width: "400px",
    }).then((result) => result.isConfirmed); // Returns true if confirmed, false otherwise
  };

  useEffect(() => {
    window.showToast = showToast;
    window.showPopup = showPopup;
    window.showConfirm = showConfirm; // Attach confirm to window
    window.alert = (message) => showPopup("Alert", message, "info");
  }, []);

  return (
    <>
      {children}
      {toastVisible && <ToastContainer />}
    </>
  );
};
