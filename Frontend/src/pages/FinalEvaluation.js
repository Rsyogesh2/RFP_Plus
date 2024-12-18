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
      <h2>Score Sections</h2>

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
              <div style={{display:"flex"}}>
                 <input
                    type="text"
                    placeholder={items[index]}
                    value={item.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="item-input"
                />
                 <input
                    type="text"
                    placeholder="Amount"
                    value={item.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="item-input"
                />
              </div>
             
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
