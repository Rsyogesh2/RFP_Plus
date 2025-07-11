import React, { useState, useEffect, useContext, useRef } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

import Button from '../Buttons/Button.js';
import { handleSave } from '../../services/Apis'

const RFPReqTable = ({ l1, rfpNo = "", rfpTitle = "", action = "" }) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const [name, setName] = useState(null); // Initially, no data
    // const [userRole, setUserRole] = useState("Maker"); // Initially, no data
    const [itemData, setItemData] = useState(null); // Initially, no data
    const [FItem, setFItem] = useState([]);
    const inputFitem = useRef(null);
    const [newItem, setNewItem] = useState(null);
    const [valueL1, setValueL1] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    // Function to add a new table
    const [editableTable, setEditableTable] = useState(null); // Tracks the table being edited
    const [tempName, setTempName] = useState(''); // Temporarily store the table name

    const { moduleData, setModuleData, userName, userPower, sidebarValue, userRole } = useContext(AppContext); // Access shared state
    // console.log(moduleData);
    console.log("userRole : " + userRole + "userPower :" + userPower)

    useEffect(() => {
        async function fetchArray() {
            // const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
            // console.log("result", result.functionalItemDetails); // Log the resolved array
            console.log("userName " + userName)
            console.log(l1)

            //23/11/2024
            try {
                // const queryParams = new URLSearchParams({ userName, l1: l1.l1module, userPower });
                // const response = await fetch(`${API_URL}/api/userAssignItemsbySub?${queryParams}`)
                // console.log(response);

                // // Check if the response is okay (Status in the range 200-299)
                // if (!response.ok) {
                //     throw new Error(`HTTP error! Status: ${response.Status}`);
                // }

                // const data = await response.json(); // Parse the JSON response
                // console.log(data);  // Handle the fetched data as needed
                if (FItem.length > 0) {
                    moduleData.functionalItemDetails[0] = FItem
                } else {

                }

                //  setItemData(data.itemDetails.l1); // Set the resolved data to local state
                setName(moduleData.itemDetails.Name); // Set the resolved data to local state
                // setModuleData(data);
                filterModule(moduleData);
                // console.log(data.itemDetails.l1);
                // setItemData(moduleData.itemDetails.l1); 
                // setFItem(moduleData.functionalItemDetails);
                // setSidebarValue(data.itemDetails);
                setFItem(moduleData.functionalItemDetails[0]);
                console.log(userRole);
            } catch (error) {
                console.error('Error sending checked items:', error); // Log any errors
            }

        }
        async function fetchArray1() {
            console.log("userName " + userName)
            console.log(l1)

            //23/11/2024
            try {
                if (FItem.length > 0) {
                    moduleData.functionalItemDetails = FItem
                } else {

                }

                //setName(moduleData.itemDetails.Name); // Set the resolved data to local state
                // setModuleData(data);
                // filterModule(moduleData);
                // console.log(data.itemDetails.l1);
                setItemData(moduleData.modules);
                // setFItem(moduleData.functionalItemDetails);
                // setSidebarValue(data.itemDetails);
                setFItem(moduleData.fitems);
                console.log(userRole);
            } catch (error) {
                console.error('Error sending checked items:', error); // Log any errors
            }

        }
        if (l1 == "Super Admin") {
            fetchArray1();
        } else if (l1?.l1module !== "" && valueL1 !== l1?.l1module) {
            fetchArray();
            setValueL1(l1.l1module);
        }
    }, [l1, itemData]);


    const filterModule = (data) => {
        // if(l1=="Super Admin"){
        //     setItemData(data);
        // }else{
        const data1 = data.itemDetails.l1[0].filter(m => m.code === l1.l1module);
        setItemData(data1);
        // }
    }

    // For Flow Code
    const currentLevel = () => {
        console.log("vuserRole : " + userRole)
        switch (true) {
            case userPower === "User" && userRole === "Maker":
                return 1;
            case userPower === "User" && userRole === "Authorizer":
                return 2;
            case userPower === "User" && userRole === "Reviewer":
                return 3;
            case userPower === "Super Admin" || userRole === "Super Admin":
                return 3;
            case userPower === "Vendor User" && userRole === "Maker":
                return 5;
            case userPower === "Vendor User" && userRole === "Authorizer":
                return 6;
            case userPower === "Vendor User" && userRole === "Reviewer":
                return 7;
            case userPower === "Vendor Admin":
                return 8;
            default:
                return null;
        }
    };
    const nextStatus = () => {
        const levelNum = currentLevel();
        switch (levelNum) {
            case 1:
                return "Bank_Pending_Authorization";
            case 2:
                return "Bank_Pending_Reviewer";
            case 3:
                return "Bank_Pending_Admin";
            case 4:
                return "Vendor_Pending_Maker";
            case 5:
                return "Vendor_Pending_Authorization";
            case 6:
                return "Vendor_Pending_Reviewer";
            case 7:
                return "Vendor_Pending_Admin";
        }
    }
    const determineLevel = () => {
        if (userPower === "User" && userRole === "Maker") return 2;
        if (userPower === "User" && userRole === "Authorizer") return 3;
        if (userPower === "User" && userRole === "Reviewer") return 4;
        if (userPower === "Super Admin") return 4;
        if (userPower === "Vendor User" && userRole === "Maker") return 6;
        if (userPower === "Vendor User" && userRole === "Authorizer") return 7;
        if (userPower === "Vendor User" && userRole === "Reviewer") return 8;
        if (userPower === "Vendor Admin") return 4;
        return 5;
    };
    const adjustStageAndStatus = (payload, action, data) => {
        if (action === "Save as Draft") {
            payload.stage = "Draft";
            payload.Status = "Bank_Pending_Maker";
            payload.assigned_to = null;
        } else if (["Submit", "Approve", "Submit to Bank", "Finalize the RFP"].includes(action)) {
            console.log(nextStatus())
            payload.Status = nextStatus();
            payload.assigned_to = data.assignedTo || null;
        } else if (action === "Reject") {
            payload.stage = "Rejected";
            payload.Status = "Rejected";
            payload.assigned_to = null;
        } else if (action === "Back to Maker") {
            payload.stage = "Draft";
            payload.Status = "Bank_Pending_Maker";
            payload.assigned_to = null;
        }
        payload.stage = userPower === "Vendor User" ? "Vendor"
            : userPower === "User" ? "Bank"
                : userPower === "Vendor Admin" ? "Bank"
                    : userPower === "Super Admin" ? "Vendor"
                        : "";
        return payload;
    };
    const constructPayload = (action, data = {}) => {

        let payload = {
            module: itemData,
            items: FItem,
            rfp_no: rfpNo || sidebarValue[0]?.rfp_no || '',
            rfp_title: sidebarValue[0]?.rfp_title || '',
            bank_name: userPower === "User" ? sidebarValue[0]?.entity_name || '' : '',
            vendor_name: userPower === "User" ? "" : sidebarValue[0]?.entity_name || '',
            created_by: userName,
            level: userPower === "User" && data.action === "Back to Maker" ? 1 : userPower === "User" && data.action === "Save as Draft" ? 1
                : userPower === "Vendor User" && data.action === "Back to Maker" ? 5 : determineLevel(),
            Comments: data.comments || "",
            Priority: data.priority || "Medium",
            Handled_by: [{ name: userName, role: userRole }],
            Action_log: `${action} by ${userName} on ${new Date().toISOString()}`,
            userPower: userPower,
        };

        payload = adjustStageAndStatus(payload, action, data);
        console.log("Constructed Payload:", payload);
        return payload;
    };
    console.log(determineLevel())
    //==================================================================================================//

    // Function to handle the Table Modification
    const findIndexByObject = (obj) => {
        return FItem.findIndex(
            (item) =>
                item.F2_Code === obj.F2_Code &&
                item.Module_Code === obj.Module_Code &&
                (!obj.New_Code || item.New_Code === obj.New_Code)
        );
    };
    const handleEditToggle = (item, e) => {
        setFItem((prevItems) =>
            prevItems.map((obj) => ({
                ...obj,
                isEditing: obj === item ? !obj.isEditing : false, // Only toggle the clicked item, reset others
            }))
        );
        console.log(item);
        // const index = findIndexByObject(item);
        // const newData = [...FItem];
        // newData[index].isEditing = !newData[index].isEditing;
        // setFItem(newData);
        // console.log(newData[index]);
    };

    const handleDelete = (item) => {
        setFItem((prevItems) =>
            prevItems.map((obj) => ({
                ...obj,
                isEditing: false, // Ensure isEditing is set to false
            }))
        );

        console.log(item.F2_Code);
        const index = findIndexByObject(item);
        const newData = [...FItem];
        newData[index].deleted = !newData[index].deleted;
        setFItem(newData);
    };


    const handleAdd = (item) => {
        // Simulate an Enter key event
        // const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
        // document.dispatchEvent(enterKeyEvent); // Dispatch the event globally (or on a specific element)
        setFItem((prevItems) =>
            prevItems.map((obj) => ({
                ...obj,
                isEditing: false, // Ensure isEditing is set to false
            }))
        );

        console.log("ADD Items:", item);

        setFItem((prevItems) => {
            let newCode;

            if (item.New_Code == "00" || !item.New_Code) {
                newCode = 10;
                prevItems = prevItems.map(existingItem => ({
                    ...existingItem,
                    New_Code: (existingItem.Module_Code === item.Module_Code &&
                        existingItem.F1_Code === item.F1_Code &&
                        existingItem.F2_Code === item.F2_Code &&
                        existingItem.New_Code !== "00" &&  // Prevent incrementing "00"
                        Number(existingItem.New_Code) >= Number(item.New_Code))
                        ? Number(existingItem.New_Code) + 1
                        : existingItem.New_Code
                }));
            } else {
                newCode = Number(item.New_Code) + 1;
                prevItems = prevItems.map(existingItem => ({
                    ...existingItem,
                    New_Code: (existingItem.Module_Code === item.Module_Code &&
                        existingItem.F1_Code === item.F1_Code &&
                        existingItem.F2_Code === item.F2_Code &&
                        existingItem.New_Code !== "00" &&  // Prevent incrementing "00"
                        Number(existingItem.New_Code) >= Number(item.New_Code + 1))
                        ? Number(existingItem.New_Code) + 1
                        : existingItem.New_Code
                }));
            }

            const newItem = {
                name: '',
                Module_Code: item.Module_Code,
                F1_Code: item.F1_Code,
                F2_Code: item.F2_Code,
                New_Code: newCode,
                isEditing: true,
                Mandatory: true
            };

            const itemIndex = prevItems.findIndex((prevItem) =>
                prevItem.F2_Code === item.F2_Code &&
                prevItem.Module_Code === item.Module_Code &&
                (!prevItem.New_Code || !item.New_Code || prevItem.New_Code === item.New_Code)
            );

            const updatedItems = [
                ...prevItems.slice(0, itemIndex + 1),
                newItem,
                ...prevItems.slice(itemIndex + 1)
            ];

            return updatedItems;
        });


    };


    const handleNameChange = (e) => {
        // Assuming `setItems` is a state setter function for an array of items
        setFItem((prevItems) =>
            prevItems.map((item) =>
                item.isEditing ? {
                    ...item, name: e.target.value, Modified_Time: new Date().toLocaleString(), // Store the current time
                    Edited_By: name,
                } : item
            )
        );
    };

    const handleMandatoryChange = (value, item, TableIndex, parentIndex, subIndex, index) => {
        console.log("fcode " + item.F2_Code + "TableIndex: " + TableIndex + " parentIndex: " + parentIndex + " subIndex " + subIndex + " index " + index)
        const indexofArray = findIndexByObject(item);
        //    consol
        console.log(indexofArray);
        const newData = [...FItem];
        console.log(FItem);
        //    console.log(newData.item.F2_Code);
        newData[indexofArray].Mandatory = value; // Update the Mandatory value

        setFItem(newData); // Update the state

    };

    // Handle the change for comments input
    const handleCommentsChange = (e, item) => {
        // if (levelType !== 'l3') {
        const indexofArray = findIndexByObject(item);
        const newData = [...FItem];
        newData[indexofArray].Comments = e.target.value; // Update the comments value
        setFItem(newData); // Update the state
        // }
    };
    //==================================================================================================//

    // Function to render the Rows of the Table
    const renderHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
        // console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array
        // console.log("levelData");
        // console.log(levelData);

        return levelData.map((item, index) => {
            const date = new Date(item.Modified_Time);
            const formattedDate = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            // date.setMinutes(date.getMinutes() + 330); // Adding 5 hours and 30 minutes
            // const formattedDate = date.toLocaleString('en-IN');
            // console.log(formattedDate);
            return (
                <tr key={`${item.Module_Code}-${item.F2_Code}-${index}`} id={`${item.Module_Code}-${item.F2_Code}-${index}`}>

                    {/* Checkbox for l2 and l3 levels */}

                    {/* Edit button for l2 and l3 levels */}
                    <td>
                        <div key={item.code} style={{ display: 'flex', gap: '0px' }}>
                            <button className='Modifybtn'
                                onClick={(e) => handleEditToggle(item, e)}>
                                {item.isEditing ? "S" : "E"}
                            </button>
                            <button className='Modifybtn' onClick={() => handleDelete(item)}>
                                D
                            </button>
                            <button className='Modifybtn' onClick={() => handleAdd(item)}>
                                A
                            </button>
                        </div>
                    </td>

                    {/* Display name, bold for l1 level */}
                    <td
                        style={{
                            paddingLeft: `${paddingLeft}px`,
                            whiteSpace: 'normal',  // Enables text wrapping
                            wordWrap: 'break-word',  // Breaks long words
                            maxWidth: '300px' // Adjust as needed for better control
                        }}
                    >
                        {!item.deleted && item.isEditing ? (
                            <input
                                type="text"
                                value={item.name}
                                placeholder="New Item"
                                onChange={handleNameChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEditToggle(item, e);
                                    }
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    textDecoration: item.deleted ? 'line-through' : 'none',
                                    fontWeight: 'normal'
                                }}
                            >
                                {item.name}
                            </span>
                        )}
                    </td>


                    {/* M and O radio buttons for l2 and l3 levels */}
                    <td style={{ textAlign: 'center' }}>
                        {
                            <input
                                type="radio"
                                name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                                checked={item.Mandatory === 1 || item.Mandatory === true}
                                onChange={() => handleMandatoryChange(true, item, TableIndex, parentIndex, subIndex, index)}
                            />
                        }
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        {
                            <input
                                type="radio"
                                name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                                checked={item.Mandatory === 0 || item.Mandatory === false}
                                onChange={() => handleMandatoryChange(false, item, TableIndex, parentIndex, subIndex, index)}
                            />
                        }
                    </td>

                    {/* Comments input for l2 and l3 levels */}
                    <td style={{ padding: "4px", height: '100%' }}>
                        <textarea
                            type="text"
                            value={item.Comments || ''}
                            onChange={(e) => handleCommentsChange(e, item)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                display: 'block'
                            }}
                        />
                    </td>


                    <td>
                        {item.Modified_Time && (
                            <p className="text-[10px] whitespace-normal break-words overflow-hidden text-clip my-[-2px] mx-[2px] font-normal">
                                {formattedDate}
                            </p>
                        )}
                    </td>
                    <td>
                        {item.Modified_Time && (
                            <p className="text-[11px] font-normal">
                                {item.Edited_By}
                            </p>
                        )}
                    </td>

                </tr>
            )
        });
    };
    const readHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
        // console.log('Rendering level:', levelType, 'with data', levelData, TableIndex, parentIndex, " subIndex " + subIndex, "  indexval " + indexval);

        if (!levelData || !Array.isArray(levelData) || (levelData[0].deleted && levelData[0].Level === 4)) return console.log("its empty"); // Ensure levelData is defined and an array

        return levelData.map((item, index) => {
            const date = new Date(item.Modified_Time);
            const formattedDate = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            // console.log(formattedDate);


            return (
                <tr key={`${item.Module_Code}-${item.F2_Code}-${index}`} id={`${item.Module_Code}-${item.F2_Code}-${index}`}>

                    <td style={{
                        fontWeight: 'normal',
                        whiteSpace: 'normal',  // Enables text wrapping
                        wordWrap: 'break-word',  // Breaks long words
                        paddingLeft: `${paddingLeft}px`
                    }}>
                        <span style={{
                            // fontWeight: levelType === 'f1' ? 300 : 'normal',
                            textDecoration: item.deleted ? 'line-through' : 'none'
                        }}>
                            {item.name}
                        </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        {
                            <input
                                type="radio"
                                name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                                checked={item.Mandatory === 1 || item.Mandatory}
                            />
                        }
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        {
                            <input
                                type="radio"
                                name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                                checked={item.Mandatory === 0 || !item.Mandatory}
                            />
                        }
                    </td>

                    <td>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: 'normal',
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}>{item.Comments || ''}</p>
                    </td>
                    <td>
                        {item.Modified_Time && (
                            <p className="text-[10px] whitespace-normal break-words overflow-hidden text-clip my-[-2px] mx-[2px] font-normal">
                                {formattedDate}
                            </p>
                        )}
                    </td>
                    <td>
                        {item.Modified_Time && (
                            <p className="text-[11px] font-normal">
                                {item.Edited_By}
                            </p>
                        )}
                    </td>

                </tr>
            )
        });
    };
    //==================================================================================================//

    // Function to render the Tables
    const Tables = (l2, index1, f1, index, indexval) => {
        // console.log(l2);
        let newItems;
        if (userRole === "Maker") {
            newItems = {
                F2_Code: '1000',
                F1_Code: `10`,
                name: "Add here...",
                Module_Code: l2.code
            };
        } else {
            newItems = {
                F2_Code: '1000',
                F1_Code: `10`,
                name: "No Items",
                Module_Code: l2.code
            };
        }

        const matchingCodes = FItem?.filter(f => f?.Module_Code?.startsWith(l2.code)) || [];
        const f1items = matchingCodes
            .filter(f1 => f1?.F2_Code?.endsWith("00") && !f1.F1_Code.endsWith("00"))
            .sort((a, b) => {
                // First, compare by F1_Code (converted to number)
                const f1Comparison = Number(a.F1_Code) - Number(b.F1_Code);

                // If F1_Code is the same, then compare by New_Code
                if (f1Comparison !== 0) {
                    return f1Comparison;
                }

                // Compare New_Code if F1_Code is the same
                return Number(a.New_Code) - Number(b.New_Code);
            });
        // console.log(f1items)
        return (
            <table className="item-table" key={l2.code + l2.newCode}>
                <colgroup>
                    {userRole === "Maker" && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1) && <col style={{ width: "8%" }} />}
                    <col style={{ width: "60%" }} />
                    <col style={{ width: "0%" }} />
                    <col style={{ width: "0.1%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                    <tr>
                        {userRole === "Maker" && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1) && <th className="col-modify">Modify</th>}
                        <th className="col-requirement">Requirement</th>
                        <th className="col-m">M</th>
                        <th className="col-o">O</th>
                        <th className="col-comments">Internal Comments</th>
                        <th className="col-modified-time">Modified Time</th>
                        <th className="col-edited-by">Edited By</th>
                    </tr>
                </thead>
                <tbody>
                    {f1items && f1items.length > 0 ? (
                        f1items.map((item, index) => {
                            const f2items = matchingCodes
                                .filter(f1 =>
                                    f1?.F2_Code &&
                                    !f1.F2_Code.endsWith("00") &&
                                    f1.F2_Code.startsWith(item.F1_Code)
                                )
                                .sort((a, b) => {
                                    // Sort by F2_Code first (as a number)
                                    const f2Comparison = Number(a.F2_Code) - Number(b.F2_Code);

                                    // If F2_Code is the same, sort by New_Code
                                    if (f2Comparison !== 0) {
                                        return f2Comparison;
                                    }

                                    // Sort by New_Code if F2_Code matches
                                    return Number(a.New_Code) - Number(b.New_Code);
                                });


                            return (
                                <React.Fragment key={item.code || index}>
                                    {userRole === 'Maker' && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1)
                                        ? renderHierarchy([item], 'f1', 10, index1, index, indexval)
                                        : readHierarchy([item], 'f1', 10, index1, index, indexval)}

                                    {f2items.map((level2, subIndex) => (
                                        <React.Fragment key={`${level2.code || ''}-${level2.newCode || ''}-${subIndex}`}>
                                            {userRole === 'Maker' && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1)
                                                ? renderHierarchy([level2], 'f2', 50, index1, index, subIndex, indexval)
                                                : readHierarchy([level2], 'f2', 50, index1, index, subIndex, indexval)}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <React.Fragment>
                            {newItems ? (
                                userRole === 'Maker' && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1)
                                    ? renderHierarchy([newItems], 'f1', 10, index1)
                                    : readHierarchy([newItems], 'f1', 10, index1)
                            ) : (
                                <tr>
                                    <td colSpan="7">No data available</td>
                                </tr>
                            )}
                        </React.Fragment>
                    )}
                </tbody>
            </table>
        );
    };

    // Function to add a new table at the L2 level
    const addTable = () => {
        console.log("Adding new table at L2 level");
        console.log(itemData);
        setItemData((prevData) =>
            prevData.map((item) => {
                // Calculate the max newCode inside prevData, considering existing l2
                const newColumnValue = item.l2.length > 0
                    ? Math.max(...item.l2.map((l) => l.newCode || 9)) + 1
                    : 10;

                return {
                    ...item,
                    l2: [
                        ...item.l2,
                        {
                            name: "", // Empty for editing
                            code: item.code + "99",
                            newCode: newColumnValue, // Correctly incremented
                        }
                    ]
                };
            })
        );

        setEditableTable(itemData.length);
        setTempName(""); // Clear temp input
    };


    const handlel2Name = (e, itemIndex, tableIndex) => {
        setTempName(e.target.value);
    };


    // Handle save action (Enter key or Save button)
    const saveTableName = (itemIndex, tableIndex) => {
        if (tempName.trim() === "") return; // Prevent empty name

        setItemData((prevData) =>
            prevData.map((item, idx) => {
                if (idx === itemIndex) {
                    return {
                        ...item,
                        l2: item.l2.map((table, tIdx) =>
                            tIdx === tableIndex ? { ...table, name: tempName } : table
                        )
                    };
                }
                return item;
            })
        );

        setEditableTable(null); // Exit edit mode
        setTempName(""); // Reset temp storage
    };

    const CollapsibleList = ({ itemData, userRole }) => {
        return (
            <div>
                {itemData.map((item, index1) => (
                    <CollapsibleSection
                        key={index1}
                        title={`${index1 + 1}. ${item.name}`}
                        content={
                            item.l2.map((l2, index2) => {
                                const indexval = `${index1 + 1}.${index2 + 1}`;
                                return (
                                    <CollapsibleSection
                                        key={l2.code}
                                        title={`${indexval} ${l2.name}`}
                                        content={
                                            l2.l3 && l2.l3.length > 0 ? (
                                                l2.l3.map((l3, index3) => (
                                                    <div key={l3.code} className="level3">
                                                        <span className="l3">{`${indexval}.${index3 + 1} ${l3.name}`}</span>
                                                        {Tables(l3, index1, "f1", index3, userRole)}
                                                    </div>
                                                ))
                                            ) : (
                                                Tables(l2, index1, "l3", index2, indexval, userRole)
                                            )
                                        }
                                    />
                                );
                            })
                        }
                    />
                ))}
            </div>
        );
    };

    const CollapsibleSection = ({ title, content }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="collapsible-section">
                <div className="header" onClick={() => setIsOpen(!isOpen)}>
                    <span>{title}</span>
                    <button className="toggle-btn">{isOpen ? "▲" : "▼"}</button>
                </div>
                {isOpen && <div className="content">{content}</div>}
            </div>
        );
    };



    return (
        <div className="rfp-table bg-white">
            <div className="flex flex-wrap justify-between items-center ">

                {/* Title Block */}
                <div className="mb-6 border-b border-gray-200 pb-3">

                    <h2 className="text-lg font-semibold text-gray-800 mb-2">RFP Details</h2>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-700">

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">RFP No:</span>
                            <span className="font-medium">{rfpNo || sidebarValue?.[0]?.rfp_no}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">RFP Title:</span>
                            <span className="font-medium">{rfpTitle || sidebarValue?.[0]?.rfp_title}</span>
                        </div>

                    </div>

                </div>

                {/* Labels Block */}
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        M-Mandatory | O-Optional
                    </span>
                    {(
                        Number(moduleData?.level) > 4 && Number(moduleData?.vendor_level) !== 4 ? "Vendor Level" :
                            Number(moduleData?.level) === 1 ? "Maker Stage" :
                                Number(moduleData?.level) === 2 ? "Authorizer Stage" :
                                    Number(moduleData?.level) === 3 ? "Reviewer Stage" : ""
                    ) && (
                            <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                {Number(moduleData?.level) > 4 && Number(moduleData?.vendor_level) !== 4 ? "Vendor Level" :
                                    Number(moduleData?.level) === 1 ? "Maker Stage" :
                                        Number(moduleData?.level) === 2 ? "Authorizer Stage" :
                                            Number(moduleData?.level) === 3 ? "Reviewer Stage" : ""}
                            </span>
                        )}

                </div>

            </div>

            <div className="module-header ">
                {itemData && itemData.length > 0 && (
                    <div className="space-y-6">
                        {itemData.map((item, index1) => (
                            <div key={index1} className="space-y-4">

                                {/* Level 1 */}
                                <div className="text-medium font-semibold text-gray-800">
                                    {index1 + 1}. {item.name}
                                </div>

                                {item.l2.map((l2, index2) => {
                                    const indexval = `${index1 + 1}.${index2 + 1}`;

                                    return (
                                        <div key={l2.code} className="pl-6 space-y-3">

                                            {/* Level 2 */}
                                            {l2.name === "" ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={tempName}
                                                        onChange={handlel2Name}
                                                        placeholder="Enter Table Name"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === "Enter" && saveTableName(index1, index2)}
                                                        className="border px-3 py-1 rounded w-64"
                                                    />
                                                    <button
                                                        onClick={() => saveTableName(index1, index2)}
                                                        className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                    >
                                                        Save
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-base font-medium text-gray-700">
                                                    {indexval} {l2.name}
                                                </div>
                                            )}

                                            {/* Level 3 */}
                                            {l2.l3 && l2.l3.length > 0 ? (
                                                <div className="pl-6 space-y-2">
                                                    {l2.l3.map((l3, index3) => (
                                                        <div key={l3.code} className="text-sm font-medium text-gray-600">
                                                            {`${indexval}.${index3 + 1}`} {l3.name}
                                                            {Tables(l3, index1, "f1", index3, userRole)}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                Tables(l2, index1, "l3", index2, indexval, userRole)
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Show Submit button only for Authorizer or Reviewer */}
            {userRole === "Authorizer" && (
                <>
                    {/* Show Authorize if level is 2 */}
                    {Number(moduleData?.level) === 2 && (
                        <button
                            className="submitbtn"
                            onClick={() => handleSave(constructPayload("Submit", {}), userPower, "RFP Authorized Successfully")}
                        >
                            Authorize
                        </button>
                    )}

                    {/* Show Back to Maker if level is 2 (assuming it still applies in this simplified form) */}
                    {Number(moduleData?.level) === 2 && (
                        <button
                            onClick={() =>
                                handleSave(
                                    constructPayload("Back to Maker", { action: "Back to Maker" }),
                                    userPower,
                                    "RFP Sent Back to Maker"
                                )
                            }
                        >
                            Back to Maker
                        </button>
                    )}
                </>
            )}

            {/* Maker actions */}
            {userRole === "Maker" && (
                Number(moduleData?.level) === 1 || moduleData?.level === undefined
            ) && (
                    <>
                        <button
                            onClick={() =>
                                handleSave(
                                    constructPayload("Save as Draft", { action: "Save as Draft" }),
                                    userPower,
                                    "RFP Saved as Draft"
                                )
                            }
                        >
                            Save as Draft
                        </button>
                        <button
                            className="submitbtn"
                            onClick={() =>
                                handleSave(
                                    constructPayload("Submit", {}),
                                    userPower,
                                    "RFP Submitted to Authorizer"
                                )
                            }
                        >
                            Submit to Authorizer
                        </button>
                    </>
                )}

            {/* Finalize RFP for Super Admin */}
            {userPower === "Super Admin" && Number(moduleData?.level) === 3 && (
                <button
                    className="submitbtn"
                    onClick={() =>
                        handleSave(
                            constructPayload("Finalize the RFP", {}),
                            userPower,
                            "RFP Finalized Successfully"
                        )
                    }
                >
                    Finalize the RFP
                </button>
            )}


        </div>
    );
};



export default RFPReqTable;