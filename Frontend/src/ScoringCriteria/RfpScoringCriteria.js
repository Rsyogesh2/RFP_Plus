
// Component for Functional Score

import React, { useState, useEffect, useContext } from 'react';
import FunctionalScore from './RFPFunctionalScore';
import CommercialScore from './CommercialScore';
import Button from './../components/Buttons/Button';
import './RfpScoringCriteria.css';
import { AppContext } from '../context/AppContext';

function RfpScoringCriteria() {
    const { sidebarValue } = useContext(AppContext); // Access shared state
    const [othersTitles, setOthersTitles] = useState({
        others1Title: "Others 1 (Specify)",
        others2Title: "Others 2 (Specify)",
        others3Title: "Others 3 (Specify)"
    });
    const [sectionsData, setSectionsData] = useState({
        implementationScore: [],
        siteScore: [],
        referenceScore: [],
        others1Score: [],
        others2Score: [],
        others3Score: []
    });
    const [overallScoringData, setOverallScoringData] = useState({});
    const [functionalScoreData, setFunctionalScoreData] = useState({});
    const [commercialScoreData, setCommercialScoreData] = useState({});

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Handlers to collect data from child components
    const handleOverallScoringData = (data) => {
        const sanitizedData = {
            ...data,
            others1: parseFloat(data.others1) || 0,
            others2: parseFloat(data.others2) || 0,
            others3: parseFloat(data.others3) || 0,
        };
        setOverallScoringData((prevState) => {
            if (JSON.stringify(prevState) !== JSON.stringify(sanitizedData)) {
                return sanitizedData;
            }
            return prevState; // No update if data hasn't changed
        });
    };

    const handleFunctionalScoreData = (data) => {
        setFunctionalScoreData((prevState) => {
            if (JSON.stringify(prevState) !== JSON.stringify(data)) {
                return data;
            }
            return prevState;
        });
    };

    const handleCommercialScoreData = (data) => {
        setCommercialScoreData((prevState) => {
            if (JSON.stringify(prevState) !== JSON.stringify(data)) {
                return data;
            }
            return prevState;
        });
    };

    const handleScoreSectionChange = (sectionKey, items) => {
        setSectionsData((prevData) => ({
            ...prevData,
            [sectionKey]: items
        }));
    };

    const handleTitlesChange = (titles) => {
        setOthersTitles((prev) => {
            // Update only if titles actually change
            if (JSON.stringify(prev) !== JSON.stringify(titles)) {
                return titles;
            }
            return prev;
        });
    };

    const handleSubmit = async () => {
        // Batch updates for scoring data
        setOverallScoringData((prev) => {
            const updatedOverallScoringData = calculateUpdatedOverallScoringData(prev);
            return updatedOverallScoringData;
        });
    
        setFunctionalScoreData((prev) => {
            const updatedFunctionalScoreData = calculateUpdatedFunctionalScoreData(prev);
            return updatedFunctionalScoreData;
        });
    
        setCommercialScoreData((prev) => {
            const updatedCommercialScoreData = calculateUpdatedCommercialScoreData(prev);
            return updatedCommercialScoreData;
        });
    
        // Use the updated state values for payload after batching
        const payload = {
            sections: [
                { title: "Implementation Score", data: sectionsData.implementationScore },
                { title: "No of Sites Score", data: sectionsData.siteScore },
                { title: "Site Reference", data: sectionsData.referenceScore },
                { title: othersTitles.others1Title, data: sectionsData.others1Title },
                { title: othersTitles.others2Title, data: sectionsData.others2Title },
                { title: othersTitles.others3Title, data: sectionsData.others3Title },
                { title: othersTitles.others1, data: sectionsData.others1Score },
                { title: othersTitles.others2, data: sectionsData.others2Score },
                { title: othersTitles.others3, data: sectionsData.others3Score }
            ],
            overallScoring: overallScoringData, // updated
            functionalScores: functionalScoreData, // updated
            commercialScores: commercialScoreData, // updated
            rfp_no: sidebarValue[0]?.rfp_no
        };
    
        // Log payload only once before making the API request
        console.log("Submitting Payload: ", payload);
    
        try {
            const response = await fetch(`${API_URL}/save-scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                alert('Data saved successfully!');
            } else {
                alert('Failed to save data.');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };
    
    // Helper functions to calculate the new state values
    const calculateUpdatedOverallScoringData = (prevData) => {
        // Add your logic to update overall scoring data
        return { ...prevData, updatedKey: 'newValue' }; // Example update
    };
    
    const calculateUpdatedFunctionalScoreData = (prevData) => {
        // Add your logic to update functional scoring data
        return { ...prevData, updatedKey: 'newValue' }; // Example update
    };
    
    const calculateUpdatedCommercialScoreData = (prevData) => {
        // Add your logic to update commercial scoring data
        return { ...prevData, updatedKey: 'newValue' }; // Example update
    };
    


    return (
        <div className="rfp-container">
            <header className="rfp-header">
                <h2>RFP SCORING CRITERIA</h2>
                <div><strong>RFP Reference No</strong> <strong>RFP Title</strong></div>
            </header>
            <div className='total-score'>
                <section className="overall-scoring">
                    <OverallScoring onTitlesChange={handleTitlesChange} onUpdate={handleOverallScoringData} />
                </section>

                <section className="functional-score">
                    <FunctionalScore onUpdate={handleFunctionalScoreData} />
                </section>

                <section className="commercial-score">
                    <CommercialScore onUpdate={handleCommercialScoreData} />
                </section>
            </div>
            <div className="score-sections">
                <ScoreSection
                    title="Implementation Score"
                    items={[
                        "Implementation & Hosting - Direct",
                        "Implementation: Partner, Hosting: Direct",
                        "Implement: Direct, Hosting: Partner",
                        "Implementation & Hosting - Partner",
                        "Others"
                    ]}
                    onSectionChange={(items) => handleScoreSectionChange('implementationScore', items)}
                />

                <ScoreSection
                    title="No of Sites Score"
                    items={[
                        "10+ installations",
                        "6-10 installations",
                        "3-5 installations",
                        "1-2 installations",
                        "Others module installations"
                    ]}
                    onSectionChange={(items) => handleScoreSectionChange('siteScore', items)}
                />

                <ScoreSection
                    title="Site Reference"
                    items={[
                        "Worst",
                        "Bad",
                        "Better",
                        "Good",
                        "Very good"
                    ]}
                    onSectionChange={(items) => handleScoreSectionChange('referenceScore', items)}
                />

                <ScoreSection
                    title={othersTitles.others1Title}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                    onSectionChange={(items) => handleScoreSectionChange('others1Score', items)}
                />

                <ScoreSection
                    title={othersTitles.others2Title}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                    onSectionChange={(items) => handleScoreSectionChange('others2Score', items)}
                />

                <ScoreSection
                    title={othersTitles.others3Title}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                    onSectionChange={(items) => handleScoreSectionChange('others3Score', items)}
                />
            </div>

            <div className="buttons">
                <button className='btn' text="Submit" onClick={handleSubmit}>Save as Draft</button>
                <button className='btn' text="Submit">Submit</button>
                <button className='btn' text="Cancel">Cancel</button>
            </div>
        </div>
    );
}



function OverallScoring({ onTitlesChange, onUpdate, rfpNo, bankId }) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const [values, setValues] = useState({
        functionalItems: "",
        commercials: "",
        implementationModel: "",
        installations: "",
        siteVisit: "",
        others1: "",
        others2: "",
        others3: "",
    });

    const [othersTitles, setOthersTitles] = useState({
        others1Title: "Others 1 (Specify)",
        others2Title: "Others 2 (Specify)",
        others3Title: "Others 3 (Specify)"
    });

    const totalSum = Object.values(values).reduce((sum, value) => sum + value, 0);

    // Notify parent component of updates
    useEffect(() => {
        if (onUpdate) {
            console.log(values,othersTitles)
            onUpdate({
                ...values,
                ...othersTitles
            });
        }
    }, [values, othersTitles, onUpdate]);

    const handleInputChange = (event, field) => {

        let newValue = Number(event.target.value.trim());

        // Check if it's a number and remove leading zeros
        // if (!isNaN(newValue) && newValue !== '') {
        //     newValue = Number(newValue.replace(/^0+(?!\.)/, '')); // Removes leading zero unless it's a decimal
        // } else {
        //     newValue = 0; // Default to 0 for invalid inputs
        // } 
        const newTotal = Object.values({
            ...values,
            [field]: newValue,
        }).reduce((sum, value) => sum + value, 0);

        if (newTotal > 100) {
            alert("Total sum cannot exceed 100.");
            return;
        }

        setValues((prevValues) => ({
            ...prevValues,
            [field]: newValue,
        }));
    };

    const handleNameChange = (event, titleField) => {
        const newTitle = event.target.value.trim() || `Others ${titleField.split('others')[1]} (Specify)`;
        setOthersTitles((prevTitles) => ({
            ...prevTitles,
            [titleField + "Title"]: newTitle,
        }));
        if (onTitlesChange) {
            onTitlesChange({ ...othersTitles, [titleField + "Title"]: newTitle });
        }
    };

    const saveData = async () => {
        if (totalSum !== 100) {
            alert("Total sum must be exactly 100 before saving.");
            return;
        }

        const data = {
            ...values,
            ...othersTitles,
            total: totalSum,
            rfpNo: rfpNo || "RFP123", // Use passed RFP_No or default
            bankId: bankId || "Bank001", // Use passed Bank_Id or default
        };
        console.log(data);
        try {
            const response = await fetch(`${API_URL}/save-Overall-scoring`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Error saving data. Please try again.");
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/fetch-scoring`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            if (!data) throw new Error("No data received");
            console.log("Fetched Data:", data);
        } catch (error) {
            console.error("Error fetching data:", error.message);
            alert("Error fetching data. Please try again.");
        }
    };

    return (
        <div className="overall-scoring">
            <h2>Overall Scoring</h2>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Overall Weightage (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Functional Items</td>
                        <td>
                            <input
                                type="number"
                                className="item-input"
                                value={values.functionalItems}
                                onChange={(e) => handleInputChange(e, 'functionalItems')}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Commercials</td>
                        <td>
                            <input
                                type="number"
                                className="item-input"
                                value={values.commercials}
                                onChange={(e) => handleInputChange(e, 'commercials')}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Implementation Model</td>
                        <td>
                            <input
                                type="number"
                                className="item-input"
                                value={values.implementationModel}
                                onChange={(e) => handleInputChange(e, 'implementationModel')}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>No of Installations</td>
                        <td>
                            <input
                                type="number"
                                className="item-input"
                                value={values.installations}
                                onChange={(e) => handleInputChange(e, 'installations')}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Site Visit Reference</td>
                        <td>
                            <input
                                type="number"
                                className="item-input"
                                value={values.siteVisit}
                                onChange={(e) => handleInputChange(e, 'siteVisit')}
                            />
                        </td>
                    </tr>
                    {["others1", "others2", "others3"].map((field, index) => (
                        <tr key={field}>
                            <td>
                                <input
                                    type="text"
                                    placeholder={`Others ${index + 1} (Specify)`}
                                    className="item-input"
                                    // value={othersTitles[field + "Title"]}
                                    onChange={(e) => handleNameChange(e, field)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="item-input"
                                    value={values[field]}
                                    onChange={(e) => handleInputChange(e, field)}
                                />
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td style={{ border: "none" }}></td>
                        <td style={{ textAlign: "center" }}>{totalSum}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={saveData}>Save Data</button>
            <button onClick={fetchData}>Fetch Data</button>
        </div>
    );
}



// Component for Commercial Score
// Reusable Score Section Component with Editable Item Names and Dropdown Scores


function ScoreSection({ title, items, onSectionChange }) {
    const [data, setData] = useState(items.map(() => ({ text: '', score: 4 })));

    const handleTextChange = (index, value) => {
        const newData = [...data];
        newData[index].text = value;
        setData(newData);
        onSectionChange(newData); // Send data to parent component
    };

    const handleScoreChange = (index, value) => {
        const newData = [...data];
        newData[index].score = parseInt(value, 10) || 0;
        setData(newData);
        onSectionChange(newData); // Send data to parent component
    };

    return (
        <div className="section">
            <h3 className="section-title">{title}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Implementation Model</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    placeholder={items[index]}
                                    value={item.text}
                                    onChange={(e) => handleTextChange(index, e.target.value)}
                                    className="item-input"
                                />
                            </td>
                            <td>
                                <select
                                    value={item.score}
                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                    className="score-dropdown"
                                >
                                    {[0, 1, 2, 3, 4].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RfpScoringCriteria;
