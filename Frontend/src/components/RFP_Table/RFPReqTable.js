import React, { useState, useEffect, useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

import Button from '../Buttons/Button.js';
import { handleSave } from '../../services/Apis'

const RFPReqTable = ({ l1 }) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    const [name, setName] = useState(null); // Initially, no data
    // const [userRole, setUserRole] = useState("Maker"); // Initially, no data
    const [itemData, setItemData] = useState(null); // Initially, no data
    const [FItem, setFItem] = useState([]); 
    const [newItem, setNewItem] = useState(null);
    const [valueL1, setValueL1] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const { moduleData, setModuleData, userName, userPower, sidebarValue,userRole } = useContext(AppContext); // Access shared state
    // console.log(moduleData);

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
    
                // // Check if the response is okay (status in the range 200-299)
                // if (!response.ok) {
                //     throw new Error(`HTTP error! Status: ${response.status}`);
                // }
    
                // const data = await response.json(); // Parse the JSON response
                // console.log(data);  // Handle the fetched data as needed
                if(FItem.length>0){
                    moduleData.functionalItemDetails=FItem
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
                setFItem(moduleData.functionalItemDetails);
                console.log(userRole);
            } catch (error) {
                console.error('Error sending checked items:', error); // Log any errors
            }
    
        }
        if(l1.l1module!=="" && valueL1!==l1.l1module){
         fetchArray();
         setValueL1(l1.l1module);
        }
    }, [l1]);
    

    const filterModule = (data) => {

        const data1 = data.itemDetails.l1.filter(m=>m.code===l1.l1module);
        setItemData(data1); 
    }

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
                isEditing: false, // Ensure isEditing is set to false
            }))
        );
        console.log(item);
        const index = findIndexByObject(item);
        const newData = [...FItem];
        newData[index].isEditing = !newData[index].isEditing;
        setFItem(newData);
        console.log(newData[index]);
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
            // Initialize the new item's base properties
            let newCode;
    
            if (!item.New_Code) {
                // Case 1: Item doesn't have New_Code, assign New_Code: 10
                newCode = 10;
            } else {
                // Case 2: Item already has New_Code, increment and ensure uniqueness
                newCode = Number(item.New_Code) + 1;
                while (prevItems.some((existingItem) =>
                    existingItem.Module_Code === item.Module_Code &&
                    existingItem.F1_Code === item.F1_Code &&
                    existingItem.F2_Code === item.F2_Code &&
                    existingItem.New_Code === newCode
                )) {
                    newCode += 1; // Increment until unique
                }
            }
    
            // Create the new item
            const newItem = {       
                name: 'New Item',
                Module_Code: item.Module_Code,
                F1_Code: item.F1_Code,
                F2_Code: item.F2_Code,
                New_Code: newCode,
                isEditing: true, // Additional flag for new items
            };
    
            console.log("New Item:", newItem);

            const itemIndex = prevItems.findIndex((prevItem) => 
                prevItem.F2_Code === item.F2_Code &&
                prevItem.Module_Code === item.Module_Code &&
                (!prevItem.New_Code || !item.New_Code || prevItem.New_Code === item.New_Code)
              );              
              console.log(itemIndex);
            const updatedItems = [
                ...prevItems.slice(0, itemIndex + 1),
                newItem,
                ...prevItems.slice(itemIndex + 1)
            ];
            // Insert the new item at the end of the array
            // const updatedItems = [...prevItems, newItem];
    
            console.log("Updated Items:", updatedItems);
            return updatedItems;
        });
    };
    

    const handleNameChange = (e) => {
        // Assuming `setItems` is a state setter function for an array of items
        setFItem((prevItems) =>
            prevItems.map((item) =>
                item.isEditing ? {
                    ...item, name: e.target.value, modifiedTime: new Date().toLocaleString(), // Store the current time
                    editedBy: name,
                } : item
            )
        );
    };

    const handleMorOChange = (value, item, TableIndex, parentIndex, subIndex, index) => {
        console.log("fcode " + item.F2_Code + "TableIndex: " + TableIndex + " parentIndex: " + parentIndex + " subIndex " + subIndex + " index " + index)
        const indexofArray = findIndexByObject(item);
        //    consol
        console.log(indexofArray);
        const newData = [...FItem];
        console.log(FItem);
        //    console.log(newData.item.F2_Code);
        newData[indexofArray].MorO = value; // Update the MorO value

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


    const renderHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
        // console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array
        // console.log("levelData");
        // console.log(levelData);
        return levelData.map((item, index) => (
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
                <td style={{ fontWeight: 'bold', paddingLeft: `${paddingLeft}px` }}>
                    {!item.deleted && item.isEditing ? (
                        <input
                            type="text"
                            value={item.name}
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
                                fontWeight: levelType === 'f1' ? 550 : 'normal',
                                textDecoration: item.deleted ? 'line-through' : 'none'
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
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-MorO`}
                            checked={item.MorO === true}
                            onChange={() => handleMorOChange(true, item, TableIndex, parentIndex, subIndex, index)}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-MorO`}
                            checked={item.MorO === false}
                            onChange={() => handleMorOChange(false, item, TableIndex, parentIndex, subIndex, index)}
                        />
                    }
                </td>

                {/* Comments input for l2 and l3 levels */}
                <td>
                    <input
                        type="text"
                        value={item.Comments || ''}
                        onChange={(e) => handleCommentsChange(e, item)}
                    />

                </td>
                <td>
                    {item.modifiedTime && (
                        <p style={{
                            fontSize: '12px', wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}
                        >
                            {item.modifiedTime} </p>)}
                </td>
                <td>
                    {item.modifiedTime &&
                        <p style={{ fontSize: '12px' }}>{item.editedBy}</p>
                    }
                </td>
            </tr>
        ));
    };
    const readHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
        console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

        return levelData.map((item, index) => (
            <tr key={`${item.Module_Code}-${item.F2_Code}-${index}`} id={`${item.Module_Code}-${item.F2_Code}-${index}`}>
     
                <td style={{ fontWeight: 'bold', paddingLeft: `${paddingLeft}px` }}>
                    <span  style={{
                                fontWeight: levelType === 'f1' ? 550 : 'normal',
                                textDecoration: item.deleted ? 'line-through' : 'none'
                            }}>
                    {item.name}
                </span>
                    </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-MorO`}
                            checked={item.MorO === 1}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-MorO`}
                            checked={item.MorO === 0 ||!item.MorO}
                        />
                    }
                </td>

                <td>
                    <p>{item.Comments || ''}</p>    
                </td>
                <td>
                    {item.modifiedTime && (
                        <p style={{
                            fontSize: '12px', wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}
                        >
                            {item.modifiedTime} </p>)}
                </td>
                <td>
                    {item.modifiedTime &&
                        <p style={{ fontSize: '12px' }}>{item.editedBy}</p>
                    }
                </td>
            </tr>
        ));
    };

    const Tables = (l2, index1, f1, index, indexval) => {
        console.log("rendering Table");
        // console.log(l2);
    
        // Validate l2.l3
        // const unMatchingCodes = l2?.l3?.map(l3 => l3.code) || [];
    
        // const newItems = unMatchingCodes.map(code => ({
        //     F2_Code: '1000',
        //     F1_Code: `10`,
        //     name: "Add here...",
        //     Module_Code: code
        // }));

        const newItems = {
            F2_Code: '1000',
            F1_Code: `10`,
            name: "Add here...",
            Module_Code: l2.code
        };

        console.log(FItem);
        // console.log(newItems);
        // console.log(newItems[index]);

    
        const matchingCodes = FItem?.filter(f => f?.Module_Code?.startsWith(l2.code)) || [];
        const f1items = matchingCodes.filter(f1 => f1?.F2_Code?.endsWith("00"));
    
        return (
            <table className="item-table">
                <colgroup>
                    {userRole === "Maker" && <col style={{ width: "8%" }} />}
                    <col style={{ width: "60%" }} />
                    <col style={{ width: "1%" }} />
                    <col style={{ width: "1%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                    <tr>
                        {userRole === "Maker" && <th className="col-modify">Modify</th>}
                        <th className="col-requirement">Requirement</th>
                        <th className="col-m">M</th>
                        <th className="col-o">O</th>
                        <th className="col-comments">Comments</th>
                        <th className="col-modified-time">Modified Time</th>
                        <th className="col-edited-by">Edited By</th>
                    </tr>
                </thead>
                <tbody>
                    {f1items && f1items.length > 0 ? (
                        f1items.map((item, index) => {
                            const f2items = matchingCodes.filter(f1 =>
                                f1?.F2_Code &&
                                !f1.F2_Code.endsWith("00") &&
                                f1.F2_Code.startsWith(item.F1_Code)
                            );
    
                            return (
                                <React.Fragment key={item.code || index}>
                                    {userRole === 'Maker'
                                        ? renderHierarchy([item], 'f1', 10, index1, index, indexval)
                                        : readHierarchy([item], 'f1', 10, index1, index, indexval)}
    
                                    {f2items.map((level2, subIndex) => (
                                        <React.Fragment key={level2.code || subIndex}>
                                            {userRole === 'Maker'
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
                                userRole === 'Maker'
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
    

    return (
        <div className="rfp-table">
            <div className="header">
                <div className="title">
                    <span>RFP No: {sidebarValue && sidebarValue[0]?.rfp_no}</span>
                    <span>RFP Title: {sidebarValue && sidebarValue[0]?.rfp_title}</span>
                </div>
            </div>
            <div className="labels">
                <span>M-Mandatory | O-Optional </span>
            </div>
            <div className="module-header">
                {itemData && itemData.length > 0 && (
                    <div>
                        {itemData.map((item, index1) => {
                            return (
                                <div key={index1} className='level1'>
                                    <span className='l1'>{index1 + 1 + ". "}{item.name}</span>
                                    {item.l2.map((l2, index2) => {
                                        const indexval = (index1 + 1) + "." + (Number(index2) + 1);
                                        return (
                                            <div key={l2.code} className='level2'>
                                                <span className='l2'>{indexval + " " + l2.name}</span>
                                                {l2.l3 && l2.l3.length > 0 ? (
                                                    <>
                                                        {l2.l3.map((l3, index) => (
                                                            <div key={l3.code} className='level3'>
                                                                <span className='l3'>{indexval + "." + (Number(index) + 1) + " " + l3.name}</span>
                                                                {Tables(l3, index1, "f1", index, userRole)}
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    Tables(l2, index1, "l3", index2, indexval, userRole)
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Show Submit button only for Authorizer or Reviewer */}
            {(userRole === "Authorizer" || userRole === "Reviewer") && (
                <button onClick={() => handleSave({
                    module: itemData,
                    items: FItem,
                    rfp_no: sidebarValue[0].rfp_no,
                    rfp_title: sidebarValue[0].rfp_title,
                    stage:"Viewer",
                    userName,
                    entity_Name:sidebarValue[0].entity_name,
                })}>
                    Submit
                    
                </button>
            )}

            {/* Optional Save as Draft button for Maker */}
            {userRole === "Maker" && (
                 <button onClick={() => handleSave({
                    module: itemData,
                    items: FItem,
                    rfp_no: sidebarValue[0].rfp_no,
                    rfp_title: sidebarValue[0].rfp_title,
                    stage:"Authorizer",
                    userName,
                    entity_Name:sidebarValue[0].entity_name,
                })}>
                    Save as Draft
                </button>
            )}
        </div>
    );
};



export default RFPReqTable;