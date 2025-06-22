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
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-gray-800 table-auto border-separate border-spacing-0">
      <colgroup>
        <col style={{ width: "65%" }} />
        <col style={{ width: "35%" }} />
      </colgroup>
      <thead className="bg-gray-100 text-left text-xs uppercase tracking-wider text-gray-600 h-12">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-3 py-2 border-b border-gray-300">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data && data.map((row, index) => (
          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
            {Object.entries(row).map(([key, value], i) => (
              <td key={i} className="px-3 py-2 border-b border-gray-200 text-center">{value}</td>
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
   <div className="modulewise-container p-6 bg-[#f9fbfd] rounded-xl space-y-8">

    {/* Section Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-300 pb-4">
        <h4 className="text-xl font-extrabold text-[#2F4F8B] tracking-wide uppercase">
            Commercial Score
        </h4>
    </div>

    {/* Score Section */}
    <div className="score-section flex flex-col lg:flex-row gap-8 items-stretch">

        {/* Benchmark Score Card */}
    <div className="w-full lg:w-1/2 xl:w-1/3 self-stretch flex flex-col p-6 bg-gradient-to-br from-[#eef3fa] to-[#f6f8fb] rounded-2xl shadow-lg border border-gray-200 space-y-6">

  <h3 className="text-lg font-bold text-[#2F4F8B] break-words text-center border-b border-[#2F4F8B] ">
    Benchmark
  </h3>

  <div className="flex-grow">
   <Table
  data={values}
  headers={["Commercial Score", "Benchmark Score", "%"]}
  colWidths={["50%", "40%", "10%"]}
/>

  </div>

</div>


        {/* Vendor Tables */}
        <div className="w-full lg:w-2/3 overflow-x-auto pb-2">
            <div className="vendor-tables inline-flex gap-6" ref={vendorRef}>
                {vendors.map((vendor, index) => (
                    <div
                        key={index}
                        className="p-6 min-w-[320px] bg-gradient-to-br from-white to-[#f9fafc] rounded-2xl shadow-lg border border-gray-200 space-y-4"
                    >
                        <h3 className="text-md font-bold text-[#2F4F8B] break-words">
                            {vendorNames[index]?.entity_name || vendor.name}
                        </h3>
                        <Table
                            data={comVendor && comVendor[index] ? transformVendorData(comVendor[index]) : []}
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

export default Commercial;
