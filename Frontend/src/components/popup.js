import React, { useState } from 'react';
import Modal from 'react-modal';
import './popup.css';

let globalShowPopup = null; // Global reference to showPopup function

export const PopupManager = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState({ title: '', message: '' });

  const showPopup = ({ title, message }) => {
    setPopupData({ title, message });
    setIsOpen(true);
  };

  const closePopup = () => setIsOpen(false);

  // Assign the showPopup function to a global variable
  globalShowPopup = showPopup;

  return (
    <>
      {children}
      <Modal
        isOpen={isOpen}
        onRequestClose={closePopup}
        contentLabel="Popup Message"
        className="popup-modal"
        overlayClassName="popup-overlay"
      >
        <div className="popup-content">
          <h2 className="popup-title">{popupData.title}</h2>
          <p className="popup-message">{popupData.message}</p>
          <button className="popup-close-button" onClick={closePopup}>
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

// Global function to show popup
export const showPopup = (title, message) => {
  if (globalShowPopup) {
    globalShowPopup({ title, message });
  } else {
    console.error('PopupManager is not initialized!');
  }
};
