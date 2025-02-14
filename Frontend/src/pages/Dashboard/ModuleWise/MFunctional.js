import React, { useEffect } from "react";
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

const MFunctional = ({values}) => {
  useEffect(() => {
    console.log(values.l2.map((l2) => ({ modules: l2.name })));
  }, [values]);
  return (
    <div className="modulewise-container">
      <h2>Final Score – Module-wise</h2>
      <div className="score-section">
        <div>
          <h3>Functional Score</h3>
          <Table
            data={values.l2.map((l2) => ({ modules: l2.name }))}
            headers={["Functional Requirement", "Benchmark Score"]}
          />
        </div>
        {vendors.map((vendor, index) => (
          <div key={index}>
            <h3>{vendor.name} - Score</h3>
            <Table
              data={[...vendor.availability, vendor.total]}
              headers={["A", "P", "C", "N", "Total Score", "%"]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MFunctional;