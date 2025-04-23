import React, { useEffect,useRef } from "react";
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
<div className="mx-4">
<table className="min-w-full border border-gray-200 rounded-xl shadow-md text-sm text-gray-700 ">
  <colgroup>
    <col style={{ width: "auto", height: "20px" }} />
    <col style={{ width: "20px", height: "20px" }} />
    <col style={{ width: "auto", height: "20px" }} />
  </colgroup>
  <thead className="bg-gray-100 text-left text-xs uppercase tracking-wider text-gray-600 h-12">
    <tr>
      {headers.map((header, index) => (
        <th key={index} className="px-4 py-3 border-b border-gray-300">{header}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {data && data.map((row, index) => (
      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
        {Object.entries(row).map(([key, value], i) => (
          <td key={i} className="px-4 py-2 border-b border-gray-200">{value}</td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
  </div>


);

const Commercial = ({ values, comVendor, vendorNames }) => {
  const vendorRef = useRef(null);

  const scrollVendors = (scrollOffset) => {
    if (vendorRef.current) {
      vendorRef.current.scrollLeft += scrollOffset;
    }
  };
  useEffect(() => {
    console.log(values);
    console.log(comVendor);
  }, [values]);

  const transformVendorData = (vendorData) => {
    if (!vendorData) return [];
  
    return values.map((benchmarkItem, index) => {
      const benchmarkKey = benchmarkItem.CommercialPattern.replace(/\s+/g, "").toLowerCase();
  
      const vendorItem = vendorData.find((item) => {
        const commercialPatternKey = Object.keys(item)[0].replace(/\s+/g, "").toLowerCase();
        return benchmarkKey === commercialPatternKey;
      });
  
      // console.log(`Row ${index + 1}:`);
      // console.log("Benchmark Item:", benchmarkItem);
      // console.log("Matching Vendor Item:", vendorItem);
  
      if (!vendorItem) {
        console.warn(`No match found for ${benchmarkItem.CommercialPattern}`);
        return { VendorScore: "-", Percentage: "-" };
      }
  
      const vendorScore = Object.values(vendorItem)[0];
      const percentage = ((vendorScore / benchmarkItem.MaxScore) * benchmarkItem.InternalPercent).toFixed(2);
  
      // console.log("Vendor Score:", vendorScore);
      // console.log("Calculated Percentage:", percentage + "%");
  
      return {
        VendorScore: vendorScore,
        Percentage: isNaN(percentage) ? "0%" : `${percentage}%`,
      };
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
            headers={["Commercial Score", "Benchmark Score", "%"]}
          />
        </div>

        <div className="vendor-container">
          {/* <button className="scroll-btn left" onClick={() => scrollVendors(-200)}>←</button> */}

          <div className="vendor-tables" ref={vendorRef}>

        <div className="vendor-tables">
          {vendors.map((vendor, index) => (
            <div key={index}>
              <h3>{vendorNames[index]?.entity_name||vendor.name}</h3>
              <Table
                data={comVendor && comVendor[index] ? transformVendorData(comVendor[index]) : []}
                headers={["Score", "%"]}
              />
            </div>
          ))}
        </div>
          {/* <button className="scroll-btn right" onClick={() => scrollVendors(200)}>→</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commercial;
