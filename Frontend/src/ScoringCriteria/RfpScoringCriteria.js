
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

    const handleTitlesChange = (titles) => {
        setOthersTitles(titles);
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
                />

                <ScoreSection
                    title={othersTitles.others1}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                />

                <ScoreSection
                    title={othersTitles.others2}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                />

                <ScoreSection
                    title={othersTitles.others3}
                    items={["To be defined", "To be defined", "To be defined", "To be defined", "To be defined"]}
                />
            </div>

            <div className="buttons">
                <button className='btn' text="Submit">Save as Draft</button>
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

function ScoreSection({ title, items }) {
    // State to track each item’s text and score
    const [data, setData] = useState(items.map((item) => ({ text: '', score: 4 })));

    // Calculate the total score by summing up the score values in the data array
    const totalScore = data.reduce((acc, item) => acc + Number(item.score), 0);

    // Handler to update the text input for an item
    const handleTextChange = (index, value) => {
        const newData = [...data];
        newData[index].text = value;
        setData(newData);
    };

    // Handler to update the score for an item
    const handleScoreChange = (index, value) => {
        const newData = [...data];
        newData[index].score = parseInt(value, 10) || 0;
        setData(newData);
    };

    return (
        <div className="section">
            <h3 className="section-title">{title}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Implementation model</th>
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
                            <td className="score">
                                <select
                                    value={item.score}
                                    className="score-dropdown"
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                    {/* <tr>
                      <td style={{border:'none'}}></td>
                      <td style={{textAlign:'center'}}>{totalScore}</td>
                    </tr> */}
                </tbody>
            </table>
            <p className="benchmark-note">(Benchmark 100% = highest defined point)</p>
            {/* <p className="total-score">Total Score: {totalScore}</p> */}
        </div>
    );
}


export default RfpScoringCriteria;
