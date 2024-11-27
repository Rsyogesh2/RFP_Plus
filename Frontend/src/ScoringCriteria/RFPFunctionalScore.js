import './FunctionalScore.css'; // Create a CSS file for styling
import React, { useState } from 'react';

const FunctionalScore = () => {
    // State for checkboxes
    const [isAvailableChecked, setIsAvailableChecked] = useState(false);
    const [isPartlyAvailableChecked, setIsPartlyAvailableChecked] = useState(false);
    const [isCustomizableChecked, setIsCustomizableChecked] = useState(false);
    const [isNotAvailableChecked, setIsNotAvailableChecked] = useState(false);

    // State for dropdown scores
    const [availableScore, setAvailableScore] = useState(0);
    const [partlyAvailableScore, setPartlyAvailableScore] = useState(0);
    const [customizableScore, setCustomizableScore] = useState(0);
    const [notAvailableScore, setNotAvailableScore] = useState(0);
    const [mandatoryScore, setMandatoryScore] = useState(0);
    const [optionalScore, setOptionalScore] = useState(0);

    // Sample values for functional items, mandatory, and optional
    const functionalItems = 10;
    const mandatory = 6;
    const optional = 4;

    // Calculate the total value based on checked boxes and dropdown scores
    const totalValue = () => {
        const availableisCheckedScore = isAvailableChecked ? availableScore : 0;
        const partlyAvailableisCheckedScore = isPartlyAvailableChecked ? partlyAvailableScore : 0;
        const customizableisCheckedScore = isCustomizableChecked ? customizableScore : 0;
        const notAvailableisCheckedScore = isNotAvailableChecked ? notAvailableScore : 0;
        let totalVal
        if (isAvailableChecked) {
            totalVal =
                availableisCheckedScore * (mandatory * mandatoryScore) +
                availableisCheckedScore * (optional * optionalScore);
        } else if (isPartlyAvailableChecked) {
            totalVal =
                partlyAvailableisCheckedScore * (mandatory * mandatoryScore) +
                partlyAvailableisCheckedScore * (optional * optionalScore);
        } else if (isCustomizableChecked) {
            totalVal =
                customizableisCheckedScore * (mandatory * mandatoryScore) +
                customizableisCheckedScore * (optional * optionalScore);
        } else if (isNotAvailableChecked) {
            totalVal = 0;
        }
        return totalVal;
    };

    return (
        <div className="functional-score">
            <h3>Functional Score</h3>

            <div className="score-section">
                <table className="response-table">
                    <thead>
                        <tr>
                            <th>Response by vendors</th>
                            <th>Select</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Available</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={isAvailableChecked}
                                    onChange={() => setIsAvailableChecked(!isAvailableChecked)}
                                />
                            </td>
                            <td>
                                <select
                                    disabled={!isAvailableChecked}
                                    value={availableScore}
                                    onChange={(e) => setAvailableScore(parseInt(e.target.value, 10))}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Partly available</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={isPartlyAvailableChecked}
                                    onChange={() => setIsPartlyAvailableChecked(!isPartlyAvailableChecked)}
                                />
                            </td>
                            <td>
                                <select
                                    disabled={!isPartlyAvailableChecked}
                                    value={partlyAvailableScore}
                                    onChange={(e) => setPartlyAvailableScore(parseInt(e.target.value, 10))}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Customizable</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={isCustomizableChecked}
                                    onChange={() => setIsCustomizableChecked(!isCustomizableChecked)}
                                />
                            </td>
                            <td>
                                <select
                                    disabled={!isCustomizableChecked}
                                    value={customizableScore}
                                    onChange={(e) => setCustomizableScore(parseInt(e.target.value, 10))}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Not available</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={isNotAvailableChecked}
                                    onChange={() => setIsNotAvailableChecked(!isNotAvailableChecked)}
                                />
                            </td>
                            <td>
                                <select
                                    disabled={!isNotAvailableChecked}
                                    value={notAvailableScore}
                                    onChange={(e) => setNotAvailableScore(parseInt(e.target.value, 10))}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </td>
                        </tr>
                        <tr style={{ border: 'none' }}>
                            <td style={{ border: 'none' }}></td>
                            <td style={{ border: 'none' }}></td>
                            <td style={{ border: 'none' }}></td>
                        </tr>
                        <tr>
                            <td>Mandatory</td>
                            <td style={{ border: 'none' }}></td>
                            <td>
                                <select
                                    value={mandatoryScore}
                                    onChange={(e) => setMandatoryScore(parseInt(e.target.value, 10))}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Optional</td>
                            <td style={{ border: 'none' }}></td>
                            <td>
                                <select
                                    value={optionalScore}
                                    onChange={(e) => setOptionalScore(parseInt(e.target.value, 10))}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div>
                <h4>Total Value: {totalValue()}</h4>
            </div>

            <p className="benchmark-note">
                (Benchmark 100% = Available score x Mandatory score)
            </p>
        </div>
    );
};

export default FunctionalScore;
