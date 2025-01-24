import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

const CommercialScore = ({ onUpdate, data }) => {
    const { sidebarValue } = useContext(AppContext); // Access shared state
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const rows = [
        "Total cost - onetime cost",
        "Average monthly subscription",
        "5 year TCO",
        "License cost",
        "Rate card (per person per day)",
    ];

    const [values, setValues] = useState(
        rows.map(() => ({
            CommercialPattern: "",
            InternalPercent: 0,
            From1: "",
            To1: "",
            Score1: "0",
            From2: "",
            To2: "",
            Score2: "0",
            From3: "",
            To3: "",
            Score3: "0",
        }))
    );

    // Initialize state from `data`
    useEffect(() => {
        if (data && Array.isArray(data) && data.length > 0) {
            const formattedData = data.map((item) => ({
                CommercialPattern: item.CommercialPattern || "",
                InternalPercent: parseFloat(item.InternalPercent) || 0,
                From1: item.From1 || "",
                To1: item.To1 || "",
                Score1: item.Score1 || "0",
                From2: item.From2 || "",
                To2: item.To2 || "",
                Score2: item.Score2 || "0",
                From3: item.From3 || "",
                To3: item.To3 || "",
                Score3: item.Score3 || "0",
            }));
            setValues(formattedData);
        }
    }, [data]);

    // Handle input changes
    const handleInputChange = (rowIndex, field, value) => {
        setValues((prevValues) => {
            const updatedValues = [...prevValues];
            updatedValues[rowIndex] = {
                ...updatedValues[rowIndex],
                [field]: value,
            };
            return updatedValues;
        });
    };

    // Notify parent component when values change
    useEffect(() => {
        if (onUpdate) {
            onUpdate(values.map((row, index) => ({ ...row, rfp_no: sidebarValue[0]?.rfp_no })));
        }
    }, [values]);

    const totalPercentage = values.reduce((sum, row) => sum + (row.InternalPercent || 0), 0);

    return (
        <div className="commercial-score">
            <h2>Commercial Score</h2>
            <table>
                <colgroup>
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "40%" }} />
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
                            rowIndex={index}
                            rowData={values[index]}
                            onInputChange={handleInputChange}
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
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const CommercialScoreRow = ({ placeholder, rowIndex, rowData, onInputChange }) => {
    const handleChange = (field, value) => {
        onInputChange(rowIndex, field, value);
    };

    return (
        <tr>
            <td>
                <textarea
                    placeholder={placeholder}
                    value={rowData.CommercialPattern}
                    onChange={(e) => handleChange("CommercialPattern", e.target.value)}
                    className="item-input textarea-input"
                    rows="2"
                />
            </td>
            <td>
                <input
                    type="number"
                    className="item-input text-input"
                    placeholder="%"
                    value={rowData.InternalPercent || ""}
                    onChange={(e) => handleChange("InternalPercent", parseFloat(e.target.value) || 0)}
                    style={{ textAlign: "center" }}
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
                            value={rowData[`From${index}`] || ""}
                            onChange={(e) => handleChange(`From${index}`, e.target.value)}
                            style={{ fontSize: "10px", width: "100%" }}
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
                            value={rowData[`To${index}`] || ""}
                            onChange={(e) => handleChange(`To${index}`, e.target.value)}
                            style={{ fontSize: "10px" }}
                        />
                    ))}
                </div>
            </td>
            <td>
                {[1, 2, 3].map((scoreIndex) => (
                    <select
                        key={`score-${scoreIndex}`}
                        className="item-input"
                        value={rowData[`Score${scoreIndex}`] || "0"}
                        onChange={(e) => handleChange(`Score${scoreIndex}`, e.target.value)}
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
};

export default CommercialScore;
