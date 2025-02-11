import React, { useEffect } from "react";
import "./MFunctional.css";

const vendors = [
  {
    name: "Vendor 1",
    scores: [4, 3, 3, 2, 3],
    total: { score: 17, percentage: "73%" },
  },
  {
    name: "Vendor 2",
    scores: [3, 4, 2, 1, 4],
    total: { score: 14, percentage: "57%" },
  },
  {
    name: "Vendor 3",
    scores: [2, 3, 4, 4, 3],
    total: { score: 16, percentage: "53%" },
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
      {data && data.map((row, index) => (
        <tr key={index}>
          {Object.entries(row).map(([key, value], i) => (
            <td key={i}>{value}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const Commercial = ({ values, comVendor }) => {
  useEffect(() => {
    console.log(values);
  }, [values]);

  const transformVendorData = (vendorData) => {
    if (!vendorData) return [];
    return vendorData.map((item) => {
      const commercialPatternKey = Object.keys(item)[0];
      if (!commercialPatternKey) return item;

      const benchmark = values.find(value => value.CommercialPattern.replace(/\s+/g, '').toLowerCase() === commercialPatternKey.replace(/\s+/g, '').toLowerCase())?.MaxScore || 0;
      const internalPercent = values.find(value => value.CommercialPattern.replace(/\s+/g, '').toLowerCase() === commercialPatternKey.replace(/\s+/g, '').toLowerCase())?.InternalPercent || 0;
      // const benchmark = values.find(value => console.log(value.CommercialPattern.replace(/\s+/g, '').toLowerCase() === commercialPatternKey.replace(/\s+/g, '').toLowerCase()));
      // const benchmark = values.find(value => console.log(value.CommercialPattern.replace(/\s+/g, '').toLowerCase() === commercialPatternKey.replace(/\s+/g, '').toLowerCase()));
      console.log(benchmark);
      // const internalPercent = values.find(value => value.CommercialPattern === item.CommercialPattern)?.InternalPercent || 1;
      const vendorScore = typeof item === 'object' ? Object.values(item)[0] : item;
      const percentage = ((vendorScore / benchmark) * internalPercent).toFixed(2);
      
      return { ...item, percentage: isNaN(percentage) ? "0%" : `${percentage}%` };
    }).sort((a, b) => {
      if (a.CommercialPattern && b.CommercialPattern) {
        return a.CommercialPattern.localeCompare(b.CommercialPattern);
      }
      return 0;
    });
  };

  return (
    <div className="modulewise-container">
      {/* Align in Row */}
      <div className="score-section">
        <div>
          <h3>Commercial Score</h3>
          <Table
            data={values}
            headers={["Commercial Score", "Benchmark Score", "Internal %"]}
          />
        </div>

        <div className="vendor-tables">
          {vendors.map((vendor, index) => (
            <div key={index}>
              <h3>{vendor.name}</h3>
              <Table
                data={comVendor && comVendor[index] ? transformVendorData(comVendor[index]) : []}
                headers={["Vendor Score", "%"]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Commercial;
