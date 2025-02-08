import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./../context/AppContext";
import './combinedpages2.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FinalEvaluation = ({rfpNo="", rfpTitle= ""}) => {
  // const [rfpNo, setRfpNo] = useState('RFP123');
  const [commercialValue, setCommercialValue] = useState([]);
  const [savedScores, setSavedScores] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorNames, setVendorNames] = useState([]);
  const [sections, setSections] = useState({
    Implementation_Score: [],
    No_of_Sites_Score: [],
    Site_Reference_Score: [],
    New_Score: [],
    Old_Score: [],
    Best_Score: []
  });
  const [selectedValues, setSelectedValues] = useState({}); // For storing selected dropdown values
  const { userName } = useContext(AppContext);
  useEffect(() => {
    const fetchVendor = async () => {
      // if (!userName) {
      //   alert("Please enter both RFP No and Bank Name");
      //   return;
      // }
      try {
        const response = await fetch(`${API_URL}/fetchVendor?userName=${userName}&&rfpNo=${rfpNo}`);
        const data = await response.json();
        setVendorNames(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchVendor();
  }, [userName]);

  // Fetch data from all tables
  const fetchData = async () => {
    try {
        const response = await fetch(`${API_URL}/fetchScores`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({selectedVendor,userName,rfpNo})
        });
        const data = await response.json();
        console.log(data)
        setSections(data[1]);
        setCommercialValue(data[0]);
        setSavedScores(data[2]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const saveDataToBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/updateBankAmount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        rfpNo, 
        selectedVendor, 
        commercialValue,
        userName
      })
    });
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        alert(result.message);  
    } else {
        const result = await response.text(); // Handle non-JSON responses
        alert(result);
    }

    await saveOrUpdateScores();
    // alert('Data Saved Successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};
const saveOrUpdateScores = async () => {
  if (!rfpNo || !selectedVendor || Object.keys(selectedValues).length === 0) {
      alert("Please fill all fields before saving.");
      return;
  }

  try {
      const payload = {
          rfpNo: rfpNo,
          selectedValues: selectedValues,
          sections,
          selectedVendor,
          userName
      };

      const response = await fetch(`${API_URL}/saveOrUpdateScores`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error("Failed to save data");
      }

      const result = await response.text();
      alert(result);
  } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
  }
};


// Handle Dropdown Change
const handleDropdownChangeVendor = (event) => {
  const selectedIndex = event.target.value;  // Index is a string
  if (selectedIndex !== "") {
      const selectedObject = vendorNames[parseInt(selectedIndex)]; // Convert to number and access object
      console.log("Selected Vendor Object:", selectedObject);
      setSelectedVendor(selectedObject); // Store the entire object
  } else {
      setSelectedVendor(null); // Reset if no selection
  }
};

const handleDropdownChange = (table, value, score) => {
  setSelectedValues(prev => ({
    ...prev,
    [table]: { value: value, score: score } // Storing both value and score
  }));
  console.log(selectedValues);
};

  return (
    <div className="rfp-page">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3>Final Evaluation</h3>
      </div>

      {/* Input fields for RFP No and Bank Name */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
        <select
         onChange={handleDropdownChangeVendor}
          style={{
            width: "80%",
            padding: "10px",
            height: "40px",
            boxSizing: "border-box"
          }}
        >
          <option>Select Vendor</option>
          {vendorNames && vendorNames.map((vName, index) => (
            <option key={index} value={index}>{vName.entity_name}</option>
          ))}
        </select>
        <button
          onClick={fetchData}
          style={{
            padding: "10px",
            height: "40px",
            boxSizing: "border-box"
          }}
        >
          Fetch Data
        </button>
      </div>

      <CollapsibleSection
        title="Commercial Pattern"
        items={commercialValue} 
        setItems={setCommercialValue}
        // items={[
        //   "Total cost – onetime cost",
        //   "Average monthly subscription",
        //   "5 year TCO",
        //   "License cost",
        //   "Rate card (per person per day)"
        // ]} 
        />

      {/* Collapsible Section with 6 Dropdowns */}
      <CollapsibleSection1 sections={sections} savedScores={savedScores} onDropdownChange={handleDropdownChange} />

      <button style={{marginTop:"15px"}}onClick={saveDataToBackend}>Save Data</button>
    </div>
  );
};

export default FinalEvaluation;

// Collapsible Section Component with 6 Dropdowns

const CollapsibleSection1 = ({ sections, onDropdownChange, savedScores }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedScores, setSelectedScores] = useState({}); // To store scores dynamically

  // Handling dropdown selection and score display
  const handleSelectionChange = (tableName, value) => {
    const selectedItem = sections[tableName].find(item => item[0] === value);
    console.log(selectedItem)
    const score = selectedItem ? selectedItem[1] : ""; // Fetch score if available
    setSelectedScores(prev => ({ ...prev, [tableName]: score }));
    onDropdownChange(tableName, value,score); // Propagate selection change upwards
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



const CollapsibleSection = ({ title, items, setItems }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleTextChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].Bank_Amount = value; // Store the amount in Bank_Amount field
    setItems(updatedItems);  // Update the state in the parent component
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
              <div key={index} style={{ display: "flex", gap: "8px", width: "100%" }}>
                {/* Display the value as plain text instead of an input field */}
                <span
                  style={{
                    flex: 4,
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "#f3f3f3"
                  }}
                >
                  {item.CommercialPattern}
                </span>
                {/* Input field for the amount */}
                <input
                  type="text"
                  placeholder="Amount"
                  value={item.Bank_Amount}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  className="item-input"
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </ul>

        </div>
      )}
    </div>
  );
};