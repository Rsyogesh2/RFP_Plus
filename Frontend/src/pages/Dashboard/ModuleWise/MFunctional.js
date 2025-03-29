import React, { useEffect,useState,useRef } from "react";
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

const MFunctional = ({values1, funVendor1, vendorNames}) => {

  const [values, setValues] = useState({ l2: [] });
  const [funVendor, setFunVendor] = useState({ l2: [] });
  const [allVendorScores, setAllVendorScores] = useState({ l2: [] });
  const [selectedIndex, setSelectedIndex] = useState(0); // Default to index 1
  const vendorRef = useRef(null);

  const scrollVendors = (scrollOffset) => {
    if (vendorRef.current) {
      vendorRef.current.scrollLeft += scrollOffset;
    }
  };
  // Update values and funVendor based on the selected dropdown option
  useEffect(() => {
    console.log(funVendor1, values1);

    if (Array.isArray(values1) && values1[selectedIndex]) {
      setValues(values1[selectedIndex]); // ✅ Update based on selection
    }

    if (Array.isArray(funVendor1) && funVendor1[selectedIndex]) {
      // setFunVendor(funVendor1[0][selectedIndex]); // ✅ Update based on selection
      setAllVendorScores(funVendor1);
      const newArray = funVendor1.map(subArray => [subArray[selectedIndex]]);
      console.log(newArray);
      setFunVendor(newArray);
    }
  }, [values1, funVendor1, selectedIndex]); // ✅ Runs when selectedIndex changes

  const transformArray = (data) => {
    const grouped = {};
  
    // Flatten the nested array
    const flatArray = data.flat();
  
    // Group by `code`
    flatArray.forEach((item) => {
      if (!grouped[item.code]) {
        grouped[item.code] = [];
      }
      grouped[item.code].push(item);
    });
  
    // Convert object to array
    return Object.values(grouped);
  };
  
  return (
    <div className="modulewise-container">
    <h4>Final Score – Module-wise</h4>
    <select onChange={(e) => setSelectedIndex(Number(e.target.value))}
       style={{
        // width: "100%",
        padding: "5px",
        fontSize: "14px",
        border: "2px solid #ddd",
        borderRadius: "4px",
        background: "#fff",
        color: "#333",
        cursor: "pointer",
        transition: "border-color 0.3s ease",
      }}>
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
         data={values.l2.map((l2Item) => {
          const matchedItem = funVendor.length > 0 && funVendor[0][0]?.l2 
            ? funVendor[0][0].l2.find(funItem => funItem.code === l2Item.code) || {} 
            : {}; 
        
          return { 
            modules: l2Item.name, 
            "Benchmark Score": matchedItem.totalScoreAll || 0  // ✅ Show `totalScoreAll` in 2nd column
          };
        })}        
          headers={["Functional Requirement", "Benchmark Score"]}
        />
      </div>
      <div className="vendor-container" style={{ position: "relative" }}>
          <button className="scroll-btn left" onClick={() => scrollVendors(-200)}>←</button>

          <div className="vendor-tables" ref={vendorRef}>

      {funVendor.length>0 && funVendor.map((vendor, index) => {
        let vendorScoreL2 =[]
        // Ensure `funVendor.l2` is sorted based on `values.l2` using `code`
        const sortedFunVendorL2 = values.l2.map(l2Item => {
          console.log("L2 Item Code:", l2Item.code);
          console.log("L2 Item Code:", index);
          console.log("funVendor.length :", funVendor.length );
          console.log("funVendor[index]?.l2:", funVendor[index][0].l2 );
          if (funVendor.length > 0 && funVendor[index][0]?.l2) {
            console.log("Checking in funVendor:", funVendor[index][0].l2);
        
            const matchedItem = funVendor[index][0].l2.find(funItem => {
              console.log("Comparing:", funItem.code, "with", l2Item.code);
              return funItem.code === l2Item.code; // ✅ Corrected condition
            }) || {}; // If no match, return an empty object
        
            console.log("Matched Item:", matchedItem);
        
            // Exclude `code` and `totalScoreAll`
            const { code, totalScoreAll, ...rest } = matchedItem;
        
            // Calculate Total Score (Sum of A, P, C)
            const totalScore = (rest.totalScoreA || 0) + (rest.totalScoreP || 0) + (rest.totalScoreC || 0);
        
            const percentage = totalScoreAll && totalScoreAll > 0 
              ? ((totalScore / totalScoreAll) * 100).toFixed(2) + "%"  // ✅ Format percentage with 2 decimal places
              : "0%";  // ✅ If totalScoreAll is 0 or undefined, show "0%"
            vendorScoreL2.push({ ...rest, "Total Score": totalScore, "%": percentage });
            return vendorScoreL2;
          }
        
          return {}; // Return empty object if no match
        });
        
        console.log(sortedFunVendorL2)
        return (
          <div key={index}>
            <h3>{vendorNames[index]?.entity_name ||vendor.name} - Score</h3>
            <Table
              data={sortedFunVendorL2[0] || []}
              headers={["A", "P", "C", "Total Score", "%"]}
            />
          </div>
        );
      })}
       <button className="scroll-btn right" onClick={() => scrollVendors(200)}>→</button>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default MFunctional;