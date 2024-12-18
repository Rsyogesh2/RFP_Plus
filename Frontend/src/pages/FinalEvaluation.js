import React, { useState } from "react";
import "./FinalEvaluation.css";

const FinalEvaluation = () => {
  const [collapsedSections, setCollapsedSections] = useState({
    commercialPattern: true,
    installations: true,
    siteReference: true,
    others1: true,
    others2: true,
    others3: true,
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="rfp-form-container">
      <h2>&lt; RFP no &gt; - &lt; RFP title &gt;</h2>
      <h3>Submitted</h3>
      <h4>Final Evaluation</h4>

      <form>
        {/* Commercial Pattern */}
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("commercialPattern")}
          >
            Commercial Pattern {collapsedSections.commercialPattern ? "▲" : "▼"}
          </div>
          {collapsedSections.commercialPattern && (
            <div className="section-content">
              <label>Total cost - onetime cost:</label>
              <input type="number" placeholder="Amount" />
              <label>Average monthly subscription:</label>
              <input type="number" placeholder="Amount" />
              <label>5 year TCO:</label>
              <input type="number" placeholder="Amount" />
              <label>License cost:</label>
              <input type="number" placeholder="Amount" />
              <label>Rate card (per person per day):</label>
              <input type="number" placeholder="Amount" />
            </div>
          )}
        </div>

        {/* No of Installations */}
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("installations")}
          >
            No of Installations by Vendor{" "}
            {collapsedSections.installations ? "▲" : "▼"}
          </div>
          {collapsedSections.installations && (
            <div className="section-content">
              <select>
                <option value="">Select</option>
                <option value="10+">10+</option>
                <option value="20+">20+</option>
              </select>
            </div>
          )}
        </div>

        {/* Site Reference */}
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("siteReference")}
          >
            Site Reference {collapsedSections.siteReference ? "▲" : "▼"}
          </div>
          {collapsedSections.siteReference && (
            <div className="section-content">
              <select>
                <option value="">Select</option>
                <option value="site1">Site 1</option>
                <option value="site2">Site 2</option>
              </select>
            </div>
          )}
        </div>

        {/* Others 1 */}
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("others1")}
          >
            Others 1 {collapsedSections.others1 ? "▲" : "▼"}
          </div>
          {collapsedSections.others1 && (
            <div className="section-content">
              <select>
                <option value="">Select</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
          )}
        </div>

        {/* Others 2 */}
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("others2")}
          >
            Others 2 {collapsedSections.others2 ? "▲" : "▼"}
          </div>
          {collapsedSections.others2 && (
            <div className="section-content">
              <select>
                <option value="">Select</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
          )}
        </div>

        {/* Others 3 */}
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("others3")}
          >
            Others 3 {collapsedSections.others3 ? "▲" : "▼"}
          </div>
          {collapsedSections.others3 && (
            <div className="section-content">
              <select>
                <option value="">Select</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button type="button" className="btn btn-draft">
            Save as Draft
          </button>
          <button type="submit" className="btn btn-submit">
            Submit
          </button>
          <button type="button" className="btn btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinalEvaluation;
