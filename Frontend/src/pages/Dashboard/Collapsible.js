import React, { useState } from 'react';
import './Collapsible.css';

const Collapsible = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible">
      <button className="collapsible-header" onClick={toggleCollapse}>
        {title}
      </button>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;