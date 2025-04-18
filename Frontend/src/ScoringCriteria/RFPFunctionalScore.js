import './FunctionalScore.css'; // Create a CSS file for styling
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const FunctionalScore = ({ onUpdate, data }) => {
    // State for checkboxes and scores
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   const { moduleData, userName, userPower, sidebarValue } = useContext(AppContext); // Access shared state
       
    const [scores, setScores] = useState({
        isAvailableChecked: false,
        isPartlyAvailableChecked: false,
        isCustomizableChecked: false,
        isNotAvailableChecked: false,
        availableScore: 0,
        partlyavailableScore: 0,
        customizableScore: 0,
        notAvailableScore: 0,
        mandatoryScore: 0,
        optionalScore: 0,
    });
    useEffect(() => {
        if(data.length>0){
            setScores(data[0])
        }
        console.log('FunctionalScore data:', data);
        onUpdate(scores);
    }, [scores, onUpdate]);

    const handleCheckboxChange = (field) => {
        setScores({ ...scores, [field]: !scores[field] });
    };

    const handleSelectChange = (field, value) => {
        setScores({ ...scores, [field]: parseInt(value, 10) });
    };

    // Calculate the total value
    const totalValue = () => {
        const { 
            isAvailableChecked, availableScore,
            isPartlyAvailableChecked, partlyavailableScore,
            isCustomizableChecked, customizableScore,
            isNotAvailableChecked, notAvailableScore,
            mandatoryScore, optionalScore 
        } = scores;

        let totalVal = 0;

        if (isAvailableChecked) {
            totalVal = availableScore * (mandatoryScore + optionalScore);
        } else if (isPartlyAvailableChecked) {
            totalVal = partlyavailableScore * (mandatoryScore + optionalScore);
        } else if (isCustomizableChecked) {
            totalVal = customizableScore * (mandatoryScore + optionalScore);
        } else if (isNotAvailableChecked) {
            totalVal = 0;
        }

        return totalVal;
    };
    function lowercaseFirstLetter(item) {
        return item.charAt(0).toLowerCase() + item.slice(1);
    }

    // Sending data to backend
    const sendDataToBackend = async () => {
        console.log(scores)
        try {
            const response = await fetch(`${API_URL}/functional-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({scores,rfpNo:sidebarValue[0]?.rfp_no,userName}),
            });
            const result = await response.json();
            console.log('Backend response:', result);
        } catch (error) {
            console.error('Error sending data to backend:', error);
        }
    };

    return (
        <div className="functional-score">
            <h2>Functional Score</h2>

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
                        {['Available', 'Partly Available', 'Customizable', 'Not available'].map((item, index) => (
                            <tr key={index}>
                                <td>{item}</td>
                                {item!=='Not available' ?(
                                <td>
                                    <input
                                    type="checkbox"
                                    checked={scores[`is${item.replace(' ', '')}Checked`]}
                                    onChange={() => handleCheckboxChange(`is${item.replace(' ', '')}Checked`)}
                                    />
                                </td>):(<td style={{ border: 'none' }}></td>)
                                }
                                <td>
                                    <select
                                        disabled={!scores[`is${item.replace(' ', '')}Checked`]}
                                        value={scores[`${item.toLowerCase()}Score`]}
                                        onChange={(e) => handleSelectChange(`${item.toLowerCase().replace(' ', '')}Score`, e.target.value)}
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
                       <tr style={{ border: 'none' }}>
                            <td style={{ border: 'none' }}></td>
                            <td style={{ border: 'none' }}></td>
                            <td style={{ border: 'none' }}></td>
                        </tr>

                        {['Mandatory', 'Optional'].map((item, index) => (
                            <tr key={index}>
                                <td>{item}</td>
                                <td style={{ border: 'none' }}></td>
                                <td>
                                    <select
                                        value={scores[`${item.toLowerCase()}Score`]}
                                        onChange={(e) => handleSelectChange(`${item.charAt(0).toLowerCase() + item.slice(1)}Score`, e.target.value)}
                                    >
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                {/* <h4>Total Value: {totalValue()}</h4> */}
            </div>

            <p className="benchmark-note">
                (Benchmark 100% = Available score x Mandatory score)
            </p>

            {/* <button onClick={sendDataToBackend}>Send to Backend</button> */}
        </div>
    );
};

export default FunctionalScore;
