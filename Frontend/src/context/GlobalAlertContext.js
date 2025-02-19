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
      customClass: {
        popup: "custom-popup",
      },
    });
  };

  useEffect(() => {
    // Attach functions to global window object
    window.showToast = showToast;
    window.showPopup = showPopup;
    window.alert = (message) => {
      showPopup("Alert", message, "info");
    };
  }, []);

  return (
    <>
      {children}
      {toastVisible && <ToastContainer />}
    </>
  );
};
