
// Component for Functional Score

import React, { useState } from 'react';
import FunctionalScore from './RFPFunctionalScore';
import CommercialScore from './CommercialScore';
import Button from './../components/Buttons/Button';
import './RfpScoringCriteria.css';

function RfpScoringCriteria() {
    const [othersTitles, setOthersTitles] = useState({
        others1: "Others 1 (Specify)",
        others2: "Others 2 (Specify)",
        others3: "Others 3 (Specify)"
    });
    const [sectionsData, setSectionsData] = useState({
        implementationScore: [],
        siteScore: [],
        referenceScore: [],
        others1Score: [],
        others2Score: [],
        others3Score: []
    });
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleScoreSectionChange = (sectionKey, items) => {
        setSectionsData((prevData) => ({
            ...prevData,
            [sectionKey]: items
        }));
    };

    const handleTitlesChange = (titles) => {
        setOthersTitles(titles);
    };
   const handleSubmit = async () => {
    const payload = {
        sections: [
            { title: "Implementation Score", data: sectionsData.implementationScore },
            { title: "No of Sites Score", data: sectionsData.siteScore },
            { title: "Site Reference", data: sectionsData.referenceScore },
            { title: othersTitles.others1, data: sectionsData.others1Score },
            { title: othersTitles.others2, data: sectionsData.others2Score },
            { title: othersTitles.others3, data: sectionsData.others3Score }
        ]
    };

    console.log("Submitting Payload: ", payload);
    // alert( payload);

    try {
        const response = await fetch(`${API_URL}/scores`, {
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


    return (
        <div className="rfp-container">
            <header className="rfp-header">
                <h2>RFP SCORING CRITERIA</h2>
                <div><strong>RFP Reference No</strong> <strong>RFP Title</strong></div>
            </header>
            <div className='total-score'>
                <section className="overall-scoring">
                    <OverallScoring onTitlesChange={handleTitlesChange} />
                </section>

                <section className="functional-score">
                    <FunctionalScore />
                </section>

                <section className="commercial-score">
                    <CommercialScore />
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
                    title={othersTitles.others1}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                    onSectionChange={(items) => handleScoreSectionChange('others1Score', items)}
                />

                <ScoreSection
                    title={othersTitles.others2}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                    onSectionChange={(items) => handleScoreSectionChange('others2Score', items)}
                />

                <ScoreSection
                    title={othersTitles.others3}
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



// Component for Overall Scoring
function OverallScoring({ onTitlesChange }) {
    const [values, setValues] = useState({
        functionalItems: 0,
        commercials: 0,
        implementationModel: 0,
        installations: 0,
        siteVisit: 0,
        others1: 0,
        others2: 0,
        others3: 0,
    });

    const [othersTitles, setOthersTitles] = useState({
        others1: "Others 1 (Specify)",
        others2: "Others 2 (Specify)",
        others3: "Others 3 (Specify)"
    });

    const handleInputChange = (event, field) => {
        const newValue = parseFloat(event.target.value) || 0;

        const newTotal = Object.values({
            ...values,
            [field]: newValue
        }).reduce((sum, value) => sum + value, 0);

        if (newTotal > 100) {
            alert("Total sum cannot exceed 100.");
            event.target.value = ""; // Clear the input field
            return;
        }

        setValues(prevValues => ({
            ...prevValues,
            [field]: newValue,
        }));
    };

    const handleNameChange = (event, titleField) => {
        const newTitle = event.target.value || `Others ${titleField.split('others')[1]} (Specify)`;
        setOthersTitles(prevTitles => ({
            ...prevTitles,
            [titleField]: newTitle
        }));
        onTitlesChange({ ...othersTitles, [titleField]: newTitle });
    };

    const totalSum = Object.values(values).reduce((sum, value) => sum + value, 0);

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
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'functionalItems')} /></td>
                </tr>
                <tr>
                    <td>Commercials</td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'commercials')} /></td>
                </tr>
                <tr>
                    <td>Implementation model</td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'implementationModel')} /></td>
                </tr>
                <tr>
                    <td>No of installations</td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'installations')} /></td>
                </tr>
                <tr>
                    <td>Site visit reference</td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'siteVisit')} /></td>
                </tr>
                <tr>
                    <td>
                        <input
                            type="text"
                            placeholder="Others 1 (Specify)"
                            className="item-input"
                            onChange={(e) => handleNameChange(e, 'others1')}
                        />
                    </td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'others1')} /></td>
                </tr>
                <tr>
                    <td>
                        <input
                            type="text"
                            placeholder="Others 2 (Specify)"
                            className="item-input"
                            onChange={(e) => handleNameChange(e, 'others2')}
                        />
                    </td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'others2')} /></td>
                </tr>
                <tr>
                    <td>
                        <input
                            type="text"
                            placeholder="Others 3 (Specify)"
                            className="item-input"
                            onChange={(e) => handleNameChange(e, 'others3')}
                        />
                    </td>
                    <td><input type="number" className="item-input" onChange={(e) => handleInputChange(e, 'others3')} /></td>
                </tr>
                <tr>
                    <td style={{ border: 'none' }}></td>
                    <td style={{textAlign:'center'}}>{totalSum}</td>
                </tr>
                </tbody>
            </table>
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
