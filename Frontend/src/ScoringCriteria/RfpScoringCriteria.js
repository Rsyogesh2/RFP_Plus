
// Component for Functional Score

import React, { useState, useEffect, useContext, useCallback } from 'react';
import FunctionalScore from './RFPFunctionalScore';
import CommercialScore from './CommercialScore';
import Button from './../components/Buttons/Button';
import './RfpScoringCriteria.css';
import { AppContext } from '../context/AppContext';
import isEqual from "lodash/isEqual"; // Correct import
import { useRef } from 'react';

function RfpScoringCriteria() {
    const { sidebarValue, userName, userRole } = useContext(AppContext); // Access shared state
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
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isExits, setIsExits] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overall");
    const overallRef = useRef(null);
    const functionalRef = useRef(null);
    const commercialRef = useRef(null);
    const otherRef = useRef(null);


    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/get-all-scores?rfpNo=${sidebarValue[0]?.rfp_no}&userName=${userName}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Data: ", data);
                setIsExits(data.sections.length > 0 ? true : false);

                setOverallScoringData(data.overallScoring || {});
                setFunctionalScoreData(data.functionalScores || {});
                setCommercialScoreData(data.commercialScores || {});

                setSectionsData({
                    implementationScore: data.sections[0]?.data || [],
                    siteScore: data.sections[1]?.data || [],
                    referenceScore: data.sections[2]?.data || [],
                    [data.overallScoring?.[0]?.others1Title ?? "others1Score"]: data.sections?.[3]?.data ?? [],
                    [data.overallScoring?.[0]?.others2Title ?? "others2Score"]: data.sections?.[4]?.data ?? [],
                    [data.overallScoring?.[0]?.others3Title ?? "others3Score"]: data.sections?.[5]?.data ?? []
                });

                setOthersTitles({
                    others1Title: data.overallScoring[0]?.others1Title || 'No value',
                    others2Title: data.overallScoring[0]?.others2Title || 'Others 2 (Specify)',
                    others3Title: data.overallScoring[0]?.others3Title || 'Others 3 (Specify)',
                });
            } else {
                console.error("Failed to fetch data.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [API_URL, sidebarValue, userName]);

    useEffect(() => {
        if (sidebarValue[0]?.rfp_no) {
            fetchData();
        }
    }, [sidebarValue, fetchData]);


    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             setLoading(true);
    //             const response = await fetch('/fetchAllScores', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                    rfpNo: sidebarValue[0].rfp_no,
    //                     userName, // Replace with actual username
    //                 }),
    //             });

    //             if (!response.ok) {
    //                 throw new Error(`Error: ${response.status}`);
    //             }

    //             const result = await response.json();
    //             setData(result);
    //         } catch (err) {
    //             setError(err.message || "Error fetching data");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, []); // Dependency array is empty to run the effect only once on mount

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error}</p>;

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

    const handleCommercialScoreData = useCallback((data) => {
        setCommercialScoreData((prevState) => {
            if (JSON.stringify(prevState) !== JSON.stringify(data)) {
                return data;
            }
            return prevState;
        });
    });

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
                { title: othersTitles.others1Title, data: sectionsData.others1Score },
                { title: othersTitles.others2Title, data: sectionsData.others2Score },
                { title: othersTitles.others3Title, data: sectionsData.others3Score }
            ],
            overallScoring: overallScoringData, // updated
            functionalScores: functionalScoreData, // updated
            commercialScores: commercialScoreData, // updated
            rfpNo: sidebarValue[0]?.rfp_no,
            userName,
            userRole
        };

        // Log payload only once before making the API request
        console.log("Submitting Payload: ", payload);

        try {
            const response = await fetch(`${API_URL}/save-all-scores`, {
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

    const renderScoreSection = (key, title, items, val) => (
        <ScoreSection
            key={key}
            newval={val}
            title={title}
            items={items}
            onSectionChange={(updatedItems) => handleScoreSectionChange(key, updatedItems)}
        />
    );

    const defaultSections = [
        {
            key: 'implementationScore',
            title: 'Implementation Score',
            items: [
                "Implementation & Hosting - Direct",
                "Implementation: Partner, Hosting: Direct",
                "Implement: Direct, Hosting: Partner",
                "Implementation & Hosting - Partner",
                "Others"
            ],
        },
        {
            key: 'siteScore',
            title: 'No of Sites Score',
            items: [
                "10+ installations",
                "6-10 installations",
                "3-5 installations",
                "1-2 installations",
                "Others module installations"
            ],
        },
        {
            key: 'referenceScore',
            title: 'Site Reference',
            items: [
                "Worst",
                "Bad",
                "Better",
                "Good",
                "Very good"
            ],
        },
        {
            key: 'others1Score',
            title: othersTitles.others1Title,
            items: Array(5).fill("To be defined"),
        },
        {
            key: 'others2Score',
            title: othersTitles.others2Title,
            items: Array(5).fill("To be defined"),
        },
        {
            key: 'others3Score',
            title: othersTitles.others3Title,
            items: Array(5).fill("To be defined"),
        },
    ];

    console.log("sectionsData :" + sectionsData)
    console.log(sectionsData)


    return (
      <div className="rfp-container max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg">

    {/* Page Heading */}
    <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-gray-900">RFP Scoring Criteria</h1>
        <p className="text-md text-gray-500 mt-2">
            {`${sidebarValue[0].rfp_no} — ${sidebarValue[0].rfp_title}`}
        </p>
    </div>

    {/* Sticky Tab Bar */}
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 mb-8">
        <div className="flex justify-center gap-6 py-3">
            {["overall", "functional", "commercial", "Other Section"].map(tab => (
                <button
                    key={tab}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${activeTab === tab
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                        }`}
                    onClick={() => {
                        setActiveTab(tab);
                        if (tab === "overall") overallRef.current?.scrollIntoView({ behavior: "smooth" });
                        if (tab === "functional") functionalRef.current?.scrollIntoView({ behavior: "smooth" });
                        if (tab === "commercial") commercialRef.current?.scrollIntoView({ behavior: "smooth" });
                        if (tab === "Other Section") otherRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    {tab === "Other Section" ? "Score Sections" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Score`}
                </button>
            ))}
        </div>
    </div>

    {/* Sections */}
    <div className="space-y-24">
   {/* Overall + Functional */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4 md:px-6">

    <section ref={overallRef} className="scroll-mt-24 max-w-3xl mx-auto">
        <OverallScoring
            data={overallScoringData}
            onTitlesChange={handleTitlesChange}
            onUpdate={handleOverallScoringData}
        />
    </section>

    <section ref={functionalRef} className="scroll-mt-24 max-w-3xl mx-auto">
        <FunctionalScore
            data={functionalScoreData}
            onUpdate={handleFunctionalScoreData}
        />
    </section>

</div>

{/* Commercial */}
<section ref={commercialRef} className="scroll-mt-24 max-w-4xl mx-auto px-4 md:px-6">
    <CommercialScore 
        data={commercialScoreData} 
        onUpdate={handleCommercialScoreData} 
    />
</section>

{/* Other Sections */}
<section ref={otherRef} className="scroll-mt-24 px-4 md:px-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {activeTab === "Other Section" && sectionsData && Object.keys(sectionsData).length > 0 ? (
            !isExits ? (
                defaultSections.map(({ key, title, items }) =>
                    <div className="max-w-3xl mx-auto">
                        {renderScoreSection(key, title, items, true)}
                    </div>
                )
            ) : (
                Object.entries(sectionsData).map(([key, items]) =>
                    <div className="max-w-3xl mx-auto">
                        {renderScoreSection(
                            key,
                            key.replace(/([A-Z])/g, " $1"),
                            Object.values(items),
                            false
                        )}
                    </div>
                )
            )
        ) : (
            defaultSections.map(({ key, title, items }) =>
                <div className="max-w-3xl mx-auto">
                    {renderScoreSection(key, title, items, true)}
                </div>
            )
        )}
    </div>
</section>


    </div>

    {/* Action Buttons */}
    <div className="flex justify-end gap-4 mt-14">
        <button
            className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            onClick={handleSubmit}
        >
            Save as Draft
        </button>
        <button
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
        >
            Submit
        </button>
        <button
            className="px-6 py-3 text-sm font-medium text-red-500 bg-red-100 rounded-xl hover:bg-red-200 transition"
        >
            Cancel
        </button>
    </div>

</div>

    );
}



function OverallScoring({ onTitlesChange, onUpdate, data }) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const { userName, sidebarValue } = useContext(AppContext); // Users load in the table

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
        others1Title: "",
        others2Title: "",
        others3Title: ""
    });

    const totalSum = Object.values(values)
        .map(value => Number(value)) // Convert each value to a number
        .filter(value => !isNaN(value)) // Filter out invalid numbers (NaN)
        .reduce((sum, value) => sum + value, 0); // Sum up the valid numbers

    // Notify parent component of updates
    useEffect(() => {
        if (data.length > 0) {
            setValues(data[0])
        }
        if (onUpdate) {
            console.log(values, othersTitles)
            onUpdate({
                ...values,
                ...othersTitles
            });
        }
    }, [values, othersTitles, onUpdate]);

    const handleInputChange = (event, field) => {

        let newValue = Number(event.target.value.trim());
        console.log("newValue", newValue);
        // Check if it's a number and remove leading zeros
        // if (!isNaN(newValue) && newValue !== '') {
        //     newValue = Number(newValue.replace(/^0+(?!\.)/, '')); // Removes leading zero unless it's a decimal
        // } else {
        //     newValue = 0; // Default to 0 for invalid inputs
        // } 
        const newTotal = Object.values({
            ...values,
            [field]: newValue,
        }).reduce((sum, value) => Number(sum) + Number(value), 0);
        console.log("newTotal", newTotal);
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
        const newTitle = event.target.value.trim() || "";
        // const newTitle = event.target.value.trim() || `Others ${titleField.split('others')[1]} (Specify)`;
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
            rfpNo: sidebarValue[0].rfp_no || "", // Use passed RFP_No or default
            userName // Use passed Bank_Id or default
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
                        <th>Overall (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Functional Items</td>
                        <td>
                            <input
                                type="number"
                                className="item-input no-spinner"
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
                                className="item-input  no-spinner"
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
                                className="item-input  no-spinner"
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
                                className="item-input  no-spinner"
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
                                className="item-input no-spinner"
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
                                    value={othersTitles[field + "Title"] || values[field + "Title"]}
                                    onChange={(e) => handleNameChange(e, field)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="item-input no-spinner"
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
        </div>
    );
}


function ScoreSection({ title, items, onSectionChange, newval }) {
    // Initialize state with the correct structure based on `items`
    const [data, setData] = useState(
        items.map((item) =>
            typeof item === "object" && item.text && item.score !== undefined
                ? item
                : { text: item, score: 0 }
        )
    );

    useEffect(() => {
        // Update state if `items` prop changes
        console.log(newval)
        setData(
            items.map((item) =>
                typeof item === "object" && item.text && item.score !== undefined
                    ? item
                    : { text: item, score: 0 }
            )
        );
    }, [newval]);

    const handleTextChange = (index, value) => {
        const newData = [...data];
        newData[index].text = value;
        setData(newData);
        onSectionChange(newData); // Send updated data to parent component
    };

    const handleScoreChange = (index, value) => {
        const newData = [...data];
        newData[index].score = parseInt(value, 10) || 0;
        setData(newData);
        onSectionChange(newData); // Send updated data to parent component
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
                                    placeholder={newval === true ? item.text : undefined} // Always show a static placeholder
                                    value={newval === true ? undefined : item.text} // Use undefined if val is true to make it uncontrolled
                                    onChange={(e) => handleTextChange(index, e.target.value)}
                                    className="item-input"
                                    disabled={!newval} // Disable input if val is true
                                />
                            </td>
                            <td>
                                <select
                                    value={newval ? undefined : item.score} // Use undefined if val is true to make it uncontrolled
                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                    className="score-dropdown"
                                    disabled={!newval} // Disable dropdown if val is true
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
