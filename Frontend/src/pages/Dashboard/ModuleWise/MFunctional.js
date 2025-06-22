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
  <div className="w-full">
    <table className="w-full table-fixed text-sm text-gray-700 border border-gray-200 rounded-md shadow-sm">
      
      {/* Add column widths here */}
      <colgroup>
        {headers.map((_, index) => (
          <col
            key={index}
            className={
              index === 3
                ? "w-[20%]" // ✅ 4th column gets more space
                : "w-[20%]" // Adjust others as needed
            }
          />
        ))}
      </colgroup>

      <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-2 py-2 text-left border-b border-gray-200 truncate"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(row).map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="px-2 py-2 border-b border-gray-100 truncate"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
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
 <div className="modulewise-container p-6 bg-[#f9fbfd] rounded-xl space-y-8">

    {/* Section Title + Dropdown */}
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-300 pb-4">
        <h4 className="text-xl font-extrabold text-[#2F4F8B] tracking-wide uppercase">
            Final Score — Module-wise
        </h4>

        <select
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="mt-3 md:mt-0 w-full md:w-64 p-2.5 border border-gray-300 rounded-md text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B2541B] focus:border-[#B2541B] transition shadow hover:shadow-md"
        >
            <option value="">Select Module</option>
            {values1?.map((value, index) => (
                <option key={index} value={index}>
                    {value.name}
                </option>
            ))}
        </select>
    </div>

    {/* Score Section */}
    <div className="score-section flex flex-col lg:flex-row gap-8">

        {/* Functional Score Card */}
        <div className="flex-1 p-6 bg-gradient-to-br from-[#eef3fa] to-[#f6f8fb] rounded-2xl shadow-lg border border-gray-200 space-y-4">
           <h3 className="text-lg font-bold text-[#2F4F8B] break-words text-center border-b border-[#2F4F8B] ">
         Functional Score
            </h3>
            <Table
                data={values.l2.map((l2Item) => {
                    const matchedItem = funVendor[0]?.[0]?.l2?.find(
                        (funItem) => funItem.code === l2Item.code
                    ) || {};
                    return {
                        modules: l2Item.name,
                        "Benchmark Score": matchedItem.totalScoreAll || 0,
                    };
                })}
                headers={["Functional Requirement", "Benchmark Score"]}
            />
        </div>

        {/* Vendor Tables */}
        <div className="flex-[2] overflow-x-auto">
            <div className="vendor-tables flex gap-6" ref={vendorRef}>
                {funVendor.length > 0 &&
                    funVendor.map((vendor, index) => {
                        const vendorScoreL2 = values.l2.map((l2Item) => {
                            const matchedItem = vendor[0]?.l2?.find(
                                (funItem) => funItem.code === l2Item.code
                            ) || {};

                            const { code, totalScoreAll, totalScoreA = 0, totalScoreP = 0, totalScoreC = 0 } = matchedItem;

                            const totalScore = totalScoreA + totalScoreP + totalScoreC;
                            const percentage =
                                totalScoreAll && totalScoreAll > 0
                                    ? ((totalScore / totalScoreAll) * 100).toFixed(2) + "%"
                                    : "0%";

                            return {
                                A: totalScoreA,
                                P: totalScoreP,
                                C: totalScoreC,
                                "Total Score": totalScore,
                                "%": percentage,
                            };
                        });

                        return (
                            <div
                                key={index}
                                className="p-6 min-w-[320px] bg-gradient-to-br from-white to-[#f9fafc] rounded-2xl shadow-lg border border-gray-200 space-y-4"
                            >
                                <h3 className="text-md font-bold text-[#2F4F8B] break-words">
                                    {vendorNames[index]?.entity_name || vendor.name} — Score
                                </h3>
                                <Table
                                    data={vendorScoreL2}
                                    headers={["A", "P", "C", "Total Score", "%"]}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>

    </div>

</div>


  
  
  );
};

export default MFunctional;