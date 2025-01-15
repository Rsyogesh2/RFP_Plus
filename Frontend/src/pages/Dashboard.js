import React, { useState } from 'react';
import './Dashboard.css'; // Assuming you will style it accordingly

const ScoringDashboard = () => {
    const [vendors] = useState([
        { name: 'Vendor 1', productName: 'Product A', productVendor: 'Vendor A', scores: [80, 85, 90, 70, 75, 88, 92, 80] },
        { name: 'Vendor 2', productName: 'Product B', productVendor: 'Vendor B', scores: [70, 75, 80, 85, 60, 78, 85, 80] },
        { name: 'Vendor 3', productName: 'Product C', productVendor: 'Vendor C', scores: [85, 90, 95, 80, 88, 92, 87, 85] }
    ]);

    const scoringComponents = [
        "Functional items", "Commercials", "Implementation model",
        "No of installations", "Site visit reference",
        "Others 1", "Others 2", "Others 3"
    ];

    return (
        <div className="scoring-dashboard">
            <table className="scoring-dashboard-table" border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th className="scoring-component-header">Scoring Components</th>
                        <th className="overall-weightage-header">Overall Weightage</th>
                        {vendors.map((vendor, index) => (
                            <th key={index} colSpan={2} className="vendor-header">
                                {vendor.name}<br />
                                {vendor.productName}<br />
                                {vendor.productVendor}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        <th></th>
                        <th>%</th>
                        {vendors.map((_, index) => (
                            <>
                                <th key={`score-${index}`} className="score-header">Score</th>
                                <th key={`weighted-${index}`} className="weighted-score-header">Weighted Score</th>
                            </>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {scoringComponents.map((component, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="scoring-component">{component}</td>
                            <td className="overall-weightage">&lt;%&gt;</td>
                            {vendors.map((vendor, vendorIndex) => (
                                <>
                                    <td key={`score-${vendorIndex}-${rowIndex}`} className="score-cell">
                                        {vendor.scores[rowIndex]}
                                    </td>
                                    <td key={`weighted-${vendorIndex}-${rowIndex}`} className="weighted-score-cell">
                                        {/* Assuming weighted score logic */}
                                        {vendor.scores[rowIndex] * 0.5} {/* Replace 0.5 with actual logic */}
                                    </td>
                                </>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={2} className="final-score-label"><strong>Final Score</strong></td>
                        {vendors.map((_, index) => (
                            <td key={`final-${index}`} colSpan={2} className="final-score-cell">
                                {/* Assuming you want to display final score */}
                                {vendors[index].scores.reduce((acc, score) => acc + score, 0)}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ScoringDashboard;
