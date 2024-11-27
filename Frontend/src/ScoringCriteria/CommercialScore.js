import React, { useState } from 'react';

const CommercialScore = () => {
    const [values, setValues] = useState({
        Total_cost: 0,
        Avs: 0,
        yearsTCO: 0,
        LicenseCost: 0,
        RateCard: 0,
    });
    
    const keys = ["Total_cost", "Avs", "yearsTCO", "LicenseCost", "RateCard"];
    const rows = [
        "Total cost - onetime cost",
        "Average monthly subscription",
        "5 year TCO",
        "License cost",
        "Rate card (per person per day)"
    ];

    const handleInputChange = (event, field) => {
        // Get the raw input value as a string
        let newValue = event.target.value;
    
        // Remove any leading zeroes
        newValue = newValue.replace(/^0+/, '');
    
        // Parse to a number or set it to an empty string if it's not a valid number
        newValue = newValue ? parseFloat(newValue) : "";
    
        // Calculate the total without the leading zeroes
        const newTotal = Object.values({
            ...values,
            [field]: newValue || 0
        }).reduce((sum, value) => sum + parseFloat(value || 0), 0);
    
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
    
    
    

    // Calculate the total percentage
    const totalPercentage = Object.values(values).reduce((sum, value) => sum + value, 0);

    return (
        <div className="commercial-score">
            <h2>Commercial Score</h2>
            <table>
                <thead>
                    <tr>
                        <th>Commercial Pattern</th>
                        <th>Internal %</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                {rows.map((placeholder, index) => (
                    <CommercialScoreRow
                        key={index}
                        placeholder={placeholder}
                        internalKey={keys[index]}
                        handleInputChange={handleInputChange}
                        value={values[keys[index]]}
                    />
                ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="1">Total</td>
                        <td style={{textAlign:'center'}}>{totalPercentage}%</td> {/* Display the calculated total percentage */}
                        <td colSpan="2"></td>
                        <td style={{textAlign:'center'}}></td>
                    </tr>
                    <tr>
                        <td colSpan="5">
                            <p className="benchmark-note">
                                (Benchmark 100% = highest defined point x internal %)
                            </p>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

function CommercialScoreRow({ placeholder, internalKey, handleInputChange, value }) {
    return (
        <tr>
            <td>
                <textarea
                    placeholder={placeholder}
                    className="item-input textarea-input"
                    rows="2"
                    style={{
                        backgroundColor: "inherit",
                        border: "none",
                        outline: "none",
                        height: "30px",
                        padding: "10px",
                        fontSize: "0.9em",
                        color: "inherit"
                    }}
                ></textarea>
            </td>
            <td>
            <input
                type="number"
                className="item-input text-input"
                placeholder="%"
                value={value || ""} // Display an empty string if the value is 0
                onChange={(e) => handleInputChange(e, internalKey)}
                style={{textAlign:'center'}}
            />
            </td>
            <td>
                <div className="amount-group">
                    {[1, 2, 3].map((index) => (
                        <input
                            key={`from-${index}`}
                            type="text"
                            className="item-input text-input"
                            placeholder="Amount"
                        />
                    ))}
                </div>
            </td>
            <td>
                <div className="amount-group">
                    {[1, 2, 3].map((index) => (
                        <input
                            key={`to-${index}`}
                            type="text"
                            className="item-input text-input"
                            placeholder="Amount"
                        />
                    ))}
                </div>
            </td>
            <td>
                {[0, 1, 2].map((scoreIndex) => (
                    <select key={`score-${scoreIndex}`} className="item-input">
                        <option value="0">0</option>
                        {[1, 2, 3, 4].map((score) => (
                            <option key={score} value={score}>
                                {score}
                            </option>
                        ))}
                    </select>
                ))}
            </td>
        </tr>
    );
}

export default CommercialScore;
