// src/components/RfpForm/CheckboxList.js
import React from 'react';
import './RfpForm.css';

const CheckboxList = ({ title, items }) => {
  return (
    <div className="checkbox-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <input type="checkbox" id={item} />
            <label htmlFor={item}>{item}</label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckboxList;
