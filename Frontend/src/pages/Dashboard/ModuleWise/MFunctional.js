import React, { useEffect,useState } from "react";
import "./MFunctional.css";
import { use } from "react";

const functionalScores = [
  { module: "L2 module", score: 120 },
  { module: "L2 module", score: 64 },
  { module: "L2 module", score: 88 },
  { module: "L2 module", score: 36 },
  { module: "L2 module", score: 60 },
  { module: "L2 module", score: 20 },
];

const vendors = [
  {
    name: "Vendor 1",
    availability: [
      { A: 88, P: 4, C: 6, N: 0, total: 98, percentage: "82%" },
      { A: 52, P: 2, C: 2, N: 0, total: 56, percentage: "88%" },
      { A: 60, P: 6, C: 0, N: 0, total: 66, percentage: "75%" },
      { A: 36, P: 0, C: 0, N: 0, total: 36, percentage: "100%" },
      { A: 40, P: 6, C: 0, N: 0, total: 52, percentage: "87%" },
      { A: 4, P: 8, C: 0, N: 0, total: 12, percentage: "60%" },
    ],
    total: { A: 280, P: 26, C: 14, N: 0, total: 320, percentage: "82%" },
  },
  {
    name: "Vendor 2",
    availability: [
      { A: 88, P: 4, C: 6, N: 0, total: 98, percentage: "82%" },
      { A: 52, P: 2, C: 2, N: 0, total: 56, percentage: "88%" },
      { A: 60, P: 6, C: 0, N: 0, total: 66, percentage: "75%" },
      { A: 36, P: 0, C: 0, N: 0, total: 36, percentage: "100%" },
      { A: 40, P: 6, C: 0, N: 0, total: 52, percentage: "87%" },
      { A: 4, P: 8, C: 0, N: 0, total: 12, percentage: "60%" },
    ],
    total: { A: 280, P: 26, C: 14, N: 0, total: 320, percentage: "82%" },
  },
  {
    name: "Vendor 3",
    availability: [
      { A: 88, P: 4, C: 6, N: 0, total: 98, percentage: "82%" },
      { A: 52, P: 2, C: 2, N: 0, total: 56, percentage: "88%" },
      { A: 60, P: 6, C: 0, N: 0, total: 66, percentage: "75%" },
      { A: 36, P: 0, C: 0, N: 0, total: 36, percentage: "100%" },
      { A: 40, P: 6, C: 0, N: 0, total: 52, percentage: "87%" },
      { A: 4, P: 8, C: 0, N: 0, total: 12, percentage: "60%" },
    ],
    total: { A: 280, P: 26, C: 14, N: 0, total: 320, percentage: "82%" },
  },
];

const Table = ({ data, headers }) => (
  <table className="styled-table">
    <thead>
      <tr>
        {headers.map((header, index) => (
          <th key={index}>{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          {Object.values(row).map((cell, i) => (
            <td key={i}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const MFunctional = ({values1, funVendor1}) => {

  const [values, setValues] = useState({ l2: [] });
  const [funVendor, setFunVendor] = useState({ l2: [] });
  const [selectedIndex, setSelectedIndex] = useState(1); // Default to index 1

  // Update values and funVendor based on the selected dropdown option
  useEffect(() => {
    console.log(funVendor1, values1);

    if (Array.isArray(values1) && values1[selectedIndex]) {
      setValues(values1[selectedIndex]); // ✅ Update based on selection
    }

    if (Array.isArray(funVendor1) && funVendor1[selectedIndex]) {
      setFunVendor(funVendor1[selectedIndex]); // ✅ Update based on selection
    }
  }, [values1, funVendor1, selectedIndex]); // ✅ Runs when selectedIndex changes

  return (
    <div className="modulewise-container">
    <h2>Final Score – Module-wise</h2>
    <select onChange={(e) => setSelectedIndex(Number(e.target.value))}>
        <option value="">Select</option>
        {values1 &&
          values1.map((value, index) => (
            <option key={index} value={index}> {/* ✅ Pass index as value */}
              {value.name}
            </option>
          ))}
      </select>
    <div className="score-section">
      <div>
        <h3>Functional Score</h3>
        
        <Table
          data={values.l2.map(l2Item => {
            const matchedItem = funVendor.l2.find(funItem => funItem.code === l2Item.code) || {};
            return { 
              modules: l2Item.name, 
              "Benchmark Score": matchedItem.totalScoreAll || 0  // ✅ Show `totalScoreAll` in 2nd column
            };
          })}
          headers={["Functional Requirement", "Benchmark Score"]}
        />
      </div>
  
      {vendors.map((vendor, index) => {
        // Ensure `funVendor.l2` is sorted based on `values.l2` using `code`
        const sortedFunVendorL2 = values.l2.map(l2Item => {
          const matchedItem = funVendor.l2.find(funItem => funItem.code === l2Item.code) || {};
          
          // Exclude `code` and `totalScoreAll` from the second table
          const { code, totalScoreAll, ...rest } = matchedItem;
  
          // Calculate Total Score (Sum of A, P, C)
          const totalScore = (rest.totalScoreA || 0) + (rest.totalScoreP || 0) + (rest.totalScoreC || 0);
  
          const percentage = totalScoreAll && totalScoreAll > 0 
          ? ((totalScore / totalScoreAll) * 100).toFixed(2) + "%"  // ✅ Format percentage with 2 decimal places
          : "0%";  // ✅ If totalScoreAll is 0 or undefined, show "0%"

        return { ...rest, "Total Score": totalScore, "%": percentage };
        });
  
        return (
          <div key={index}>
            <h3>{vendor.name} - Score</h3>
            <Table
              data={sortedFunVendorL2}
              headers={["A", "P", "C", "Total Score", "%"]}
            />
          </div>
        );
      })}
    </div>
  </div>
  
  );
};

export default MFunctional;