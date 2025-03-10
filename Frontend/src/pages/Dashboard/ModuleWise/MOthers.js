import React, { useEffect, useState } from "react";
import "./MFunctional.css";

const vendors = [
  {
    name: "Vendor 1",
    scores: [4, 3, 3, 2],
    total: { score: 12, percentage: "60%" },
  },
  {
    name: "Vendor 2",
    scores: [3, 4, 2, 1],
    total: { score: 10, percentage: "50%" },
  },
  {
    name: "Vendor 3",
    scores: [2, 3, 4, 4],
    total: { score: 13, percentage: "65%" },
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

const MOthers = ({ values, othersVendor, vendorNames }) => {
  const [otherScores, setOtherScores] = useState([
    { category: "Implementation Score", benchmark: 5 },
    { category: "No of Sites Score", benchmark: 5 },
    { category: "Site Reference Score", benchmark: 5 },
  ]);

  useEffect(() => {
    if (values) {
      setOtherScores(values);
    }
    console.log(values);
    console.log(othersVendor);
  }, [values]);

  // Transform othersVendor object into an array of objects with percentage calculation
  const transformVendorData = (vendorData) => {
    if (!vendorData) return [];
  
    return Object.entries(vendorData).map(([key, value]) => {
      const matchedScore = otherScores.find(score => {
        const normalizedCategory = score.category.replace(/\s+/g, "_").toLowerCase();
        const normalizedKey = key.replace(/\s+/g, "_").toLowerCase();
        return normalizedCategory === normalizedKey;
      });
  
      const benchmark = matchedScore ? matchedScore.benchmark : 0;
      let percentage = benchmark ? ((value / benchmark) * 100).toFixed(2) : "0";
  
      console.log(`Matching Key: ${key}, Vendor Score: ${value}, Benchmark: ${benchmark}, Percentage: ${percentage}%`);
  
      return { VendorScore: value, Percentage: `${percentage}%` };
    });
  };
  

  return (
    <div className="modulewise-container">
      {/* Align in Row */}
      <div className="score-section">
        <div>
          <h3>Other Scores</h3>
          <Table data={otherScores} headers={["Other Score", "Benchmark Score"]} />
        </div>

        <div className="vendor-tables">
          {vendors.map((vendor, index) => (
            <div key={index}>
              <h3>{vendorNames[index]?.entity_name||vendor.name}</h3>
              <Table
                data={transformVendorData(othersVendor[index])}
                headers={["Vendor Score", "%"]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MOthers;