import React, {useState} from "react";
import './FinalEvaluation.css';
const FinalEvaluation = () => {
  const othersTitles = {
    others1: "Custom Field 1",
    others2: "Custom Field 2",
    others3: "Custom Field 3",
  };

  return (
    <div className="rfp-page">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3>
          <span>{"< RFP no > - < RFP title >"}</span>
          <br />
          <span>Submitted</span>
          <br />
          <span>Final Evaluation</span>
        </h3>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <label htmlFor="vendor-select" style={{ marginRight: "10px" }}>
          Select Vendor:
        </label>
        <select id="vendor-select" style={{ flex: 1, marginRight: "10px" }}>
          <option value="">Select</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>
        <button style={{ padding: "5px 10px" }}>Go</button>
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
      {/* Implementation Score */}
      <CollapsibleSection
        title="Implementation Score"
        items={[
          "Implementation & Hosting - Direct",
          "Implementation: Partner, Hosting: Direct",
          "Implement: Direct, Hosting: Partner",
          "Implementation & Hosting - Partner",
          "Others",
        ]}
      />

      {/* No of Sites Score */}
      <CollapsibleSection
        title="No of Sites Score"
        items={[
          "10+ installations",
          "6-10 installations",
          "3-5 installations",
          "1-2 installations",
          "Others module installations",
        ]}
      />

      {/* Site Reference */}
      <CollapsibleSection
        title="Site Reference"
        items={["Worst", "Bad", "Better", "Good", "Very good"]}
      />

      {/* Others Sections */}
      <CollapsibleSection
        title={othersTitles.others1}
        items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
      />

      <CollapsibleSection
        title={othersTitles.others2}
        items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
      />

      <CollapsibleSection
        title={othersTitles.others3}
        items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
      />
    </div>
  );
};

export default FinalEvaluation;


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
                style={{ flex: 3 }} // 75% of the space
              />
              <input
                type="text"
                placeholder="Amount"
                value={item.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                className="item-input"
                style={{ flex: 1 }} // 25% of the space
              />
            </div>
            
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
