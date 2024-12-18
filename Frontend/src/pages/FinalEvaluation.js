import React, { useState } from "react";
import './FinalEvaluation.css';

const FinalEvaluation = () => {
  const [formData, setFormData] = useState({
    vendor: "",
    totalCost: "",
    avgSubscription: "",
    fiveYearTCO: "",
    licenseCost: "",
    rateCard: "",
    installations: "",
    siteReference: "",
    others1: "",
    others2: "",
    others3: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <div className="rfp-form-container">
      <h2>&lt; RFP no &gt; - &lt; RFP title &gt;</h2>
      <h3>Submitted</h3>
      <h4>Final Evaluation</h4>

      <form onSubmit={handleSubmit}>
        {/* Vendor Selection */}
        <div className="form-group">
          <label>Select Vendor:</label>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select</option>
            <option value="vendor1">Vendor 1</option>
            <option value="vendor2">Vendor 2</option>
          </select>
          <button type="button">Go</button>
        </div>

        {/* Commercial Pattern */}
        <fieldset>
          <legend>Commercial Pattern</legend>
          <div className="form-group">
            <label>Total cost - onetime cost:</label>
            <input
              type="number"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              placeholder="Amount"
            />
          </div>
          <div className="form-group">
            <label>Average monthly subscription:</label>
            <input
              type="number"
              name="avgSubscription"
              value={formData.avgSubscription}
              onChange={handleChange}
              placeholder="Amount"
            />
          </div>
          <div className="form-group">
            <label>5 year TCO:</label>
            <input
              type="number"
              name="fiveYearTCO"
              value={formData.fiveYearTCO}
              onChange={handleChange}
              placeholder="Amount"
            />
          </div>
          <div className="form-group">
            <label>License cost:</label>
            <input
              type="number"
              name="licenseCost"
              value={formData.licenseCost}
              onChange={handleChange}
              placeholder="Amount"
            />
          </div>
          <div className="form-group">
            <label>Rate card (per person per day):</label>
            <input
              type="number"
              name="rateCard"
              value={formData.rateCard}
              onChange={handleChange}
              placeholder="Amount"
            />
          </div>
        </fieldset>

        {/* Implementation Model */}
        <div className="form-group">
          <label>No of installations by vendor:</label>
          <select
            name="installations"
            value={formData.installations}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="10">10+</option>
            <option value="20">20+</option>
          </select>
        </div>

        {/* Site Reference */}
        <div className="form-group">
          <label>Site reference:</label>
          <select
            name="siteReference"
            value={formData.siteReference}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="site1">Site 1</option>
            <option value="site2">Site 2</option>
          </select>
        </div>

        {/* Other Options */}
        {["others1", "others2", "others3"].map((field, index) => (
          <div className="form-group" key={index}>
            <label>Others {index + 1}:</label>
            <select
              name={field}
              value={formData[field]}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>
        ))}

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
