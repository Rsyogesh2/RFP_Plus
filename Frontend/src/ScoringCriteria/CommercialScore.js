import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
const CommercialScore = ({ onUpdate }) => {
    const { sidebarValue } = useContext(AppContext); // Access shared state
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

    // Notify parent about changes in scores whenever `values` state updates
    useEffect(() => {
        const rowsData = rows.map((row, index) => {
            // Safely retrieve values
            const getInputValue = (id) => {
                const element = document.querySelector(id);
                return element ? element.value : ""; // Default to an empty string if null
            };
    
            return {
                CommercialPattern: getInputValue(`#commercial-pattern-${index}`) || "",
                InternalPercent: values[keys[index]] || 0,
                From1: getInputValue(`#from-${index}-1`),
                To1: getInputValue(`#to-${index}-1`),
                Score1: getInputValue(`#score-${index}-0`),
                From2: getInputValue(`#from-${index}-2`),
                To2: getInputValue(`#to-${index}-2`),
                Score2: getInputValue(`#score-${index}-1`),
                From3: getInputValue(`#from-${index}-3`),
                To3: getInputValue(`#to-${index}-3`),
                Score3: getInputValue(`#score-${index}-2`),
                rfp_no: sidebarValue[0]?.rfp_no,
            };
        });

    
        if (onUpdate) {
            onUpdate(rowsData);
            // console.log(rowsData)
        }
    }, [values, sidebarValue, onUpdate]);
    
    const handleSubmit = async () => {
        const rowsData = rows.map((row, index) => {
            // Safely retrieve values
            const getInputValue = (id) => {
                const element = document.querySelector(id);
                return element ? element.value : ""; // Default to an empty string if null
            };

            return {
                CommercialPattern: getInputValue(`#commercial-pattern-${index}`) || "",
                InternalPercent: values[keys[index]] || 0,
                From1: getInputValue(`#from-${index}-1`),
                To1: getInputValue(`#to-${index}-1`),
                Score1: getInputValue(`#score-${index}-0`),
                From2: getInputValue(`#from-${index}-2`),
                To2: getInputValue(`#to-${index}-2`),
                Score2: getInputValue(`#score-${index}-1`),
                From3: getInputValue(`#from-${index}-3`),
                To3: getInputValue(`#to-${index}-3`),
                Score3: getInputValue(`#score-${index}-2`),
                rfp_no: sidebarValue[0]?.rfp_no,
            };
        });

        try {
            const response = await fetch(`${API_URL}/commercial-scores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rowsData),
            });

            if (response.ok) {
                alert("Data saved successfully!");
            } else {
                alert("Error saving data.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error submitting data.");
        }
    };

    const handleInputChange = (event, field) => {
        let newValue = event.target.value;

        newValue = newValue.replace(/^0+/, "");
        newValue = newValue ? parseFloat(newValue) : "";

        const newTotal = Object.values({
            ...values,
            [field]: newValue || 0,
        }).reduce((sum, value) => sum + parseFloat(value || 0), 0);

        if (newTotal > 100) {
            alert("Total sum cannot exceed 100.");
            event.target.value = "";
            return;
        }

        setValues((prevValues) => ({
            ...prevValues,
            [field]: newValue,
        }));
    };

    const totalPercentage = Object.values(values).reduce((sum, value) => sum + value, 0);

    return (
        <div className="commercial-score">
            <h2>Commercial Score</h2>
            <table>
                <colgroup>
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "60%" }} />
                    <col style={{ width: "5%" }} />
                </colgroup>
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
                            rowIndex={index}
                        />
                    ))}
                </tbody>

                <tfoot>
                    <tr>
                        <td colSpan="1">Total</td>
                        <td style={{ textAlign: "center" }}>{totalPercentage}%</td>
                        <td colSpan="2"></td>
                        <td style={{ textAlign: "center" }}></td>
                    </tr>
                    <tr>
                        <td colSpan="5">
                            <p className="benchmark-note">
                                (Benchmark 100% = highest defined point x internal %)
                            </p>
                            {/* <button onClick={handleSubmit}>Submit</button> */}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

function CommercialScoreRow({ placeholder, internalKey, handleInputChange, value, rowIndex }) {
    return (
        <tr>
            <td>
                <textarea
                     id={`commercial-pattern-${rowIndex}`} // Unique ID for each textarea
                    placeholder={placeholder}
                    className="item-input textarea-input"
                    rows="2"
                    style={{
                        backgroundColor: "inherit",
                        border: "none",
                        outline: "none",
                        height: "70px",
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
                    style={{ textAlign: 'center' }}
                />
            </td>
            <td>
                <div className="amount-group">
                    {[1, 2, 3].map((index) => (
                        <input
                            key={`from-${rowIndex}-${index}`}
                            id={`from-${rowIndex}-${index}`}
                            type="text"
                            className="item-input text-input"
                            placeholder="Amount"
                            style={{fontSize:"10px" }}
                        />
                    ))}
                </div>
            </td>
            <td>
                <div className="amount-group">
                    {[1, 2, 3].map((index) => (
                        <input
                            key={`to-${rowIndex}-${index}`}
                            id={`to-${rowIndex}-${index}`}
                            type="text"
                            className="item-input text-input"
                            placeholder="Amount"
                            style={{fontSize:"10px"}}
                        />
                    ))}
                </div>
            </td>
            <td>
                {[0, 1, 2].map((scoreIndex) => (
                    <select
                        key={`score-${rowIndex}-${scoreIndex}`}
                        id={`score-${rowIndex}-${scoreIndex}`}
                        className="item-input"
                    >
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
