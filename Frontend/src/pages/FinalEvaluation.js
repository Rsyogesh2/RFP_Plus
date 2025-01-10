import React, { useState } from "react";
import './combinedpages2.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FinalEvaluation = () => {
  const [rfpNo, setRfpNo] = useState('RFP123');
  const [bankName, setBankName] = useState('Sample Bank');
  const [sections, setSections] = useState({
    Implementation_Score: [],
    No_of_Sites_Score: [],
    Site_Reference_Score: [],
    New_Score: [],
    Old_Score: [],
    Best_Score: []
  });
  const [selectedValues, setSelectedValues] = useState({}); // For storing selected dropdown values

  // Fetch data from all tables
  const fetchData = async () => {
    if (!rfpNo || !bankName) {
      alert("Please enter both RFP No and Bank Name");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/fetchScores?rfpNo=${rfpNo}&bankName=${bankName}`);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handle Dropdown Change
  const handleDropdownChange = (table, value) => {
    setSelectedValues(prev => ({
      ...prev,
      [table]: value
    }));
  };

  return (
    <div className="rfp-page">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3>Final Evaluation</h3>
      </div>

      {/* Input fields for RFP No and Bank Name */}
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter RFP No"
          value={rfpNo}
          onChange={(e) => setRfpNo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Bank Name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />
        <button onClick={fetchData}>Fetch Data</button>
      </div>

      <CollapsibleSection
        title="Commercial Pattern"
        items={[
          "Total cost – onetime cost",
          "Average monthly subscription",
          "5 year TCO",
          "License cost",
          "Rate card (per person per day)"
        ]} />

      {/* Collapsible Section with 6 Dropdowns */}
      <CollapsibleSection1 sections={sections} onDropdownChange={handleDropdownChange} />
    </div>
  );
};

export default FinalEvaluation;

// Collapsible Section Component with 6 Dropdowns

const CollapsibleSection1 = ({ sections, onDropdownChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedScores, setSelectedScores] = useState({}); // To store scores dynamically

  // Handling dropdown selection and score display
  const handleSelectionChange = (tableName, value) => {
    const selectedItem = sections[tableName].find(item => item[0] === value);
    console.log(selectedItem)
    const score = selectedItem ? selectedItem[1] : ""; // Fetch score if available
    setSelectedScores(prev => ({ ...prev, [tableName]: score }));
    onDropdownChange(tableName, value); // Propagate selection change upwards
  };

  return (
    <div className="collapsible-section">
      {/* Collapsible Header */}
      <div className="section-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        Scoring Criteria {isCollapsed ? "▲" : "▼"}
      </div>

      {/* Collapsible Content */}
      {isCollapsed && (
        <div className="section-content">
          {Object.keys(sections).map((tableName, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <label><strong>{tableName.replace(/_/g, " ")}</strong></label>
              
              {/* Dropdown and Score Input */}
              <div style={{ display: "flex", gap: "8px", width: "100%", marginBottom: "15px" }}>
                
                {/* Dropdown */}
                <select
                  onChange={(e) => handleSelectionChange(tableName, e.target.value)}
                  defaultValue=""
                  style={{ flex: 4 }}
                >
                  <option value="" disabled>Select an option</option>
                  {sections[tableName].map((item, idx) => (
                    <option key={idx} value={item[0]}>
                      {item[0]}
                    </option>
                  ))}
                </select>

                {/* Score Field (Auto-filled) */}
                <input
                  type="text"
                  placeholder="Score"
                  value={selectedScores[tableName] || ""}
                  readOnly
                  className="item-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const CollapsibleSection = ({ title, items }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleTextChange = (index, value) => {
    // const newData = [...data];
    // newData[index].text = value;
    // setData(newData);
  };
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="collapsible-section">
      {/* Header */}
      <div className="section-header" onClick={toggleCollapse}>
        {title} {isCollapsed ? "▲" : "▼"}
      </div>

      {/* Content */}
      {isCollapsed && (
        <div className="section-content">
          <ul>
            {items.map((item, index) => (
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <input
                  type="text"
                  placeholder={items[index]}
                  value={item.text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  className="item-input"
                  style={{ flex: 4 }} // 80% of the space
                />
                <input
                  type="text"
                  placeholder="Amount"
                  value={item.text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  className="item-input"
                  style={{ flex: 1 }} // 20% of the space
                />
              </div>

            ))}
          </ul>
        </div>
      )}
    </div>
  );
};