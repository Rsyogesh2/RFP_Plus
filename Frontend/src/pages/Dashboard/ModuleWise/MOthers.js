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
  <div className="modulewise-container p-6 bg-[#f9fbfd] rounded-xl space-y-8">

    {/* Section Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-300 pb-4">
        <h4 className="text-xl font-extrabold text-[#2F4F8B] tracking-wide uppercase">
            Other Scores
        </h4>
    </div>

    {/* Score Section */}
    <div className="score-section flex flex-col lg:flex-row gap-8 items-stretch">

        {/* Benchmark Score Card */}
        <div className="w-full lg:w-1/3 self-stretch flex flex-col justify-center p-6 bg-gradient-to-br from-[#eef3fa] to-[#f6f8fb] rounded-2xl shadow-lg border border-gray-200 space-y-6">

            <h3 className="text-lg font-bold text-[#2F4F8B] text-center border-b border-[#2F4F8B] pb-2">
                Benchmark
            </h3>

            <Table
                className="w-full text-sm text-gray-800 text-center"
                data={otherScores}
                headers={["Other Score", "Benchmark Score"]}
            />

        </div>

        {/* Vendor Tables */}
        <div className="w-full lg:w-2/3 overflow-x-auto pb-2">
            <div className="vendor-tables inline-flex gap-6">
                {vendors.map((vendor, index) => (
                    <div
                        key={index}
                        className="p-6 min-w-[320px] bg-gradient-to-br from-white to-[#f9fafc] rounded-2xl shadow-lg border border-gray-200 space-y-4"
                    >
                        <h3 className="text-md font-bold text-[#2F4F8B] break-words text-center border-b border-[#2F4F8B] pb-2">
                            {vendorNames[index]?.entity_name || vendor.name}
                        </h3>

                        <Table
                            className="w-full text-sm text-gray-800 text-center"
                            data={transformVendorData(othersVendor[index])}
                            headers={["Score", "%"]}
                        />

                    </div>
                ))}
            </div>
        </div>

    </div>

</div>

  );
};

export default MOthers;