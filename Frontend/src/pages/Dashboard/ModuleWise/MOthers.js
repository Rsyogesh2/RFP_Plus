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
  <div className="overflow-x-auto rounded-s shadow-lg border border-gray-200 bg-white mx-3 text-gray-700">
  <table className="min-w-full text-sm text-left border-separate border-spacing-0">
      <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600 h-12 sticky top-0 z-10">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-4 py-3 font-semibold border-b border-blue-200 text-xs uppercase tracking-wider text-center"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-gray-800">
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`transition duration-200 white`}
          >
            {headers.map((header, cellIndex) => (
              <td
                key={cellIndex}
                className="px-4 py-3 border-b border-gray-200 text-center whitespace-nowrap"
              >
                {row[Object.keys(row)[cellIndex]] ?? ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
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
  
      console.log(`Matching Key: ${key}, Score: ${value}, Benchmark: ${benchmark}, Percentage: ${percentage}%`);
  
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
                headers={["Score", "%"]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MOthers;