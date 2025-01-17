import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const ScoringDashboard = ({rfpNo=""}) => {
    const [scoringData, setScoringData] = useState([]);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    // const scoringComponents = [
        //     "Functional items", "Commercials", "Implementation model",
        //     "No of installations", "Site visit reference",
        //     "Others 1", "Others 2", "Others 3"
        // ];
    
        // const weightage = [10, 15, 20, 10, 15, 10, 10, 10]; // Example weightage values
        const [scoringComponents, setScoringComponents] = useState([
            "Functional items", "Commercials", "Implementation model",
            "No of installations", "Site visit reference"
        ]);
        const [weightage, setWeightage] = useState([10, 15, 20, 10, 15]); // Default weightage
      
        const [vendors, setVendors] = useState([
            { name: 'Vendor 1', scores: [80, 85, 90, 70, 75, 88, 92, 80] },
            { name: 'Vendor 2', scores: [70, 75, 80, 85, 60, 78, 85, 80] },
            { name: 'Vendor 3', scores: [85, 90, 95, 80, 88, 92, 87, 85] }
        ]);
        
        useEffect(() => {
            const fetchfinalEvaluation = async () => {
                try {
                    const response = await fetch(`${API_URL}/fetchFinalEvaluationScores`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch scoring data');
                    }
                    const data = await response.json();
                    console.log("Fetched Data:", data);
        
                    // Update the last 6 scores safely
                    setVendors(prevVendors =>
                        prevVendors.map((vendor, index) => ({
                            ...vendor,
                            scores: [
                                ...vendor.scores.slice(0, 2), // Keep the first 2 scores
                                ...(data[index]?.scores ? data[index].scores.slice(-6) : vendor.scores.slice(2)) // Replace last 6 only if data exists
                            ]
                        }))
                    );
        
                } catch (error) {
                    console.error('Error fetching scoring data:', error);
                }
            };
            fetchfinalEvaluation();
        }, []);
        
    useEffect(() => {
        const fetchScoringData = async () => {
            try {
                const response = await fetch(`${API_URL}/fetch-scoring-overall`);
                if (!response.ok) {
                    throw new Error('Failed to fetch scoring data');
                }
                const data = await response.json();
                setScoringData(data);

                if (data.length > 0) {
                    const scoringItem = data[0]; // Assuming a single object response
                    // Update components and weightage based on response
                    const updatedComponents = [
                        "Functional items", "Commercials", "Implementation model",
                        "No of installations", "Site visit reference"
                    ];

                    const updatedWeightage = [
                        scoringItem.functional_items,
                        scoringItem.commercials,
                        scoringItem.implementation_model,
                        scoringItem.no_of_installations,
                        scoringItem.site_visit_reference
                    ];

                    // Adding dynamic "Others" fields if present
                    for (let i = 1; i <= 3; i++) {
                        if (scoringItem[`others${i}_title`] && scoringItem[`others${i}_value`] != null) {
                            updatedComponents.push(scoringItem[`others${i}_title`]);
                            updatedWeightage.push(scoringItem[`others${i}_value`]);
                        }
                    }

                    setScoringComponents(updatedComponents);
                    setWeightage(updatedWeightage);
                }
            } catch (error) {
                console.error('Error fetching scoring data:', error);
            }
        };

        fetchScoringData();
    }, []);
    
    
    return (
        <div className="scoring-dashboard">
            <table className="scoring-dashboard-table" border="1" cellPadding="10">
                {/* HEADER */}
                <thead>
                    <tr>
                        <th className="scoring-component-header">Scoring Components</th>
                        <th className="overall-weightage-header">Overall Weightage</th>
                        {/* Gap added before the first vendor */}
                        <th className="vendor-gap"></th> 
                        {vendors.map((vendor, index) => (
                            <React.Fragment key={`header-${index}`}>
                                <th colSpan={2} className="vendor-header">
                                    {vendor.name}<br />
                                    {vendor.productName}<br />
                                    {vendor.productVendor}
                                </th>
                                {index < vendors.length - 1 && <th className="vendor-gap"></th>}
                            </React.Fragment>
                        ))}
                    </tr>
                    <tr>
                        <th></th>
                        <th>%</th>
                        <th className="vendor-gap"></th> {/* Gap before the first vendor */}
                        {vendors.map((_, index) => (
                            <React.Fragment key={`subheader-${index}`}>
                                <th className="score-header">Score</th>
                                <th className="weighted-score-header">Weighted Score</th>
                                {index < vendors.length - 1 && <th className="vendor-gap"></th>}
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>

                {/* BODY */}
                <tbody>
                    {scoringComponents.map((component, rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                            <td className="scoring-component">{component}</td>
                            <td className="overall-weightage">{weightage[rowIndex]}%</td>
                            <td className="vendor-gap"></td> {/* Gap before the first vendor */}
                            {vendors.map((vendor, vendorIndex) => {
                                const weightedScore = (vendor.scores[rowIndex] * weightage[rowIndex]) / 100;
                                return (
                                    <React.Fragment key={`vendor-body-${vendorIndex}-${rowIndex}`}>
                                        <td className="score-cell"><span>{vendor.scores[rowIndex]}%</span>
                                        </td>
                                        <td className="weighted-score-cell">
                                        <span>{weightedScore.toFixed(2)}%</span>
                                        </td>
                                        {vendorIndex < vendors.length - 1 && <td className="vendor-gap"></td>}
                                    </React.Fragment>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>

                {/* FOOTER */}
                <tfoot>
                    <tr>
                        <td colSpan={2} className="final-score-label"><strong>Final Score</strong></td>
                        <td className="vendor-gap"></td> {/* Gap before the first vendor */}
                        {vendors.map((vendor, index) => {
                            const finalScore = vendor.scores.reduce((acc, score, idx) =>
                                acc + (score * weightage[idx]) / 100, 0);
                            return (
                                <React.Fragment key={`final-${index}`}>
                                    <td colSpan={2} className="final-score-cell">
                                    <span>{finalScore.toFixed(2)}%</span>
                                    </td>
                                    {index < vendors.length - 1 && <td className="vendor-gap"></td>}
                                </React.Fragment>
                            );
                        })}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default ScoringDashboard;
