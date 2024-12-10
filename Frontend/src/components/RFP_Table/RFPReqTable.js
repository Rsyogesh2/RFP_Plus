import React, { useState, useEffect, useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

import Button from '../Buttons/Button.js';
import { handleSave } from '../../services/Apis'

const RFPReqTable = ({ l1, userRole }) => {

    const [name, setName] = useState(null); // Initially, no data
    const [itemData, setItemData] = useState(null); // Initially, no data
    const [FItem, setFItem] = useState([{
        name: "",
        Module_Code: "",
        F1_Code: "",
        F2_Code: "",
        isEditing: false,
        MorO: "",
        Comments: "",
        deleted: false

    }]); // Initially, no data
    // const [newFItem, setnewFItem] = useState( [{name: "",
    //     Module_Code: "",
    //     F1_Code: "10",
    //     F2_Code: "1000",
    //     F1:"true",
    //     F2:"false",
    //     isEditing: false,
    //     MorO: "",
    //     Comments: ""}]); // Initially, no data
    const [newItem, setNewItem] = useState(null);
    const { moduleData, userName, userPower, sidebarValue } = useContext(AppContext); // Access shared state
    // console.log(moduleData);

    useEffect(() => {
        // Define an async function to log array and set item data
        async function fetchArray() {
            // const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
            // console.log("result", result.functionalItemDetails); // Log the resolved array
            console.log("userName " + userName)
            console.log(l1)
            //23/11/2024
            try {
                const queryParams = new URLSearchParams({ userName, l1: l1.l1module, userPower });
                const response = await fetch(`/api/userAssignItemsbySub?${queryParams}`)
                console.log(response);

                // Check if the response is okay (status in the range 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json(); // Parse the JSON response
                console.log(data);  // Handle the fetched data as needed

                setItemData(data.itemDetails.l1); // Set the resolved data to local state
                setName(data.itemDetails.Name); // Set the resolved data to local state
                console.log(data.itemDetails.l1);
                // setSidebarValue(data.itemDetails);
                setFItem(data.functionalItemDetails);
            } catch (error) {
                console.error('Error sending checked items:', error); // Log any errors
            }

        } fetchArray();

    }, [moduleData]);


    const findIndexByObject = (obj) => {
        return FItem.findIndex(
            (item) =>
                item.F2_Code === obj.F2_Code &&
                item.Module_Code === obj.Module_Code &&
                (!obj.New_Code || item.New_Code === obj.New_Code)
        );
    };
    const handleEditToggle = (item, e) => {
        console.log(item);
        const index = findIndexByObject(item);
        const newData = [...FItem];
        newData[index].isEditing = !newData[index].isEditing;
        setFItem(newData);
        console.log(newData[index]);
    };

    const handleDelete = (item) => {
        console.log(item.F2_Code);

        const index = findIndexByObject(item);
        const newData = [...FItem];
        newData[index].deleted = !newData[index].deleted;
        setFItem(newData);
        // setFItem((prevItems) => {
        //     // Deep clone prevItems to avoid direct state mutation
        //     const updatedItems = prevItems.filter(
        //         (f) => !(f.F2_Code === item.F2_Code && f.Module_Code === item.Module_Code)
        //     );
        //      console.log(updatedItems)
        //     // Return the modified items array to update the state
        //     return updatedItems;
        // });
    };


    const handleAdd = (item) => {
        console.log(item)
        setFItem((prevItems) => {
            // const updatedItems = JSON.parse(JSON.stringify(prevItems));
            // const newItem = { name: 'New Item', F2_Code: item.F2_Code, isEditing: true };
            // updatedItems[item] = [];
            // // updatedItems[0].l2[l1].l3.push(newItem);
            //     updatedItems[item].splice(item + 1, 0, newItem);

            // const itemsWithSameF2Code = prevItems.filter(
            //     (prevItem) => prevItem.F2_Code === item.F2_Code && prevItem.Module_Code === item.Module_Code
            //      && (!item.New_Code || prevItem.New_Code === item.New_Code)
            // );
            const matchingItems = prevItems.filter(
                existingItem =>
                    existingItem.Module_Code === item.Module_Code &&
                    existingItem.F1_Code === item.F1_Code &&
                    existingItem.F2_Code === item.F2_Code
            );

            // Find the maximum New_Code in the matching items
            const maxNewCode = Math.max(
                0,
                ...matchingItems.map(existingItem => Number(existingItem.New_Code) || 0)
            );
            console.log(matchingItems)
            // Create a new item with auto-incremented F2_Code
            let newItem
            if (matchingItems.length>0&&matchingItems[0].F2_Code.endsWith("00")) {
                if (item.New_Code) {
                    // Filter items with the same Module_Code, F1_Code, and F2_Code

                    // Create the new item with incremented New_Code
                    setNewItem([{
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        New_Code: maxNewCode + 1
                    }]);

                    newItem = {
                        name: 'New Item',
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        New_Code: maxNewCode + 1,
                        isEditing: true
                    };
                }
                else {
                    newItem = {
                        name: 'New Item',
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        New_Code: 10,
                        isEditing: true
                    }
                };
            } else if(matchingItems.length==0){
                if (item.New_Code) {
                    newItem = {
                        name: 'New Item',
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        New_Code: Number(item.New_Code) + 1,
                        isEditing: true
                    }
                }
                else {
                    newItem = {
                        name: 'New Item',
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        isEditing: true
                    };
                }    
            }
            else {
                if (item.New_Code) {
                    newItem = {
                        name: 'New Item',
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        New_Code: Number(item.New_Code) + 1,
                        isEditing: true
                    }
                }
                else {
                    newItem = {
                        name: 'New Item',
                        Module_Code: `${item.Module_Code}`,
                        F1_Code: `${item.F1_Code}`,
                        F2_Code: `${item.F2_Code}`,
                        isEditing: true
                    };
                }
            }
            const itemIndex = prevItems.findIndex(
                (prevItem) => prevItem.F2_Code === item.F2_Code && prevItem.Module_Code === item.Module_Code
            );
            console.log(newItem)
            // Return the updated items list with the new item added
            // return [...prevItems, newItem];
            const updatedItems = [
                ...prevItems.slice(0, itemIndex + 1),
                newItem,
                ...prevItems.slice(itemIndex + 1)
            ];
            console.log(FItem);
            return updatedItems;
        }
        )

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

        return levelData.map((item, index) => (
            <tr key={`${item.F2_Code}-${index}`} id={`${item.F2_Code}-${index}`}>

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
                <td style={{ fontWeight: 'normal', paddingLeft: `${paddingLeft}px` }}>
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
                                fontWeight: levelType === 'f1' ? 500 : 'normal',
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
                            name={`${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-MorO`}
                            checked={item.MorO === true}
                            onChange={() => handleMorOChange(true, item, TableIndex, parentIndex, subIndex, index)}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-MorO`}
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
        // console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

        return levelData.map((item, index) => (
            <tr key={`${item.F2_Code}-${index}`} id={`${item.F2_Code}-${index}`}>

                
                <td>{item.name}</td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-MorO`}
                            checked={item.MorO === true}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-MorO`}
                            checked={item.MorO === false}
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
        // console.log(items);
        console.log("rendering Table");
        // Ensure FItem is an array
        const unMatchingCodes = l2.l3.map(l3 => l3.code);

        // Create an array of newItem for all unMatchingCodes
        const newItems = unMatchingCodes.map((code, index) => ({
            F2_Code: '1000',
            F1_Code: `10`,
            name: code,
            Module_Code: l2.code
        }));

        console.log(newItems);


        const matchingCodes = FItem.filter(f => f.Module_Code.startsWith(l2.code));
        // console.log(matchingCodes);
        const f1items = matchingCodes.filter(f1 => f1.F2_Code.endsWith("00"));
        // console.log(f1items);
        // const f2items = matchingCodes.filter(f1=>!(f1.F2_Code.endsWith("00"))&&f1.F2_Code!==""&&f1.F2_Code.startsWith(f1.F1_Code))
        // console.log(f2items);

        return (
            <table className="item-table">
                <colgroup>
                {userRole==="Maker"&&<col style={{ width: "8%" }} />}
                    <col style={{ width: "60%" }} />
                    <col style={{ width: "1%" }} />
                    <col style={{ width: "1%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                    <tr>
                        {userRole==="Maker"&&<th className="col-modify">Modify</th>}
                        <th className="col-requirement">Requirement</th>
                        <th className="col-m">M</th>
                        <th className="col-o">O</th>
                        <th className="col-comments">Comments</th>
                        <th className="col-modified-time">Modified Time</th>
                        <th className="col-edited-by">Edited By</th>
                    </tr>
                </thead>
                <tbody>
                    {/* {items[l]&&items[l].map((item, index) => ( */}
                    {f1items && f1items.length > 0 ? (
                        f1items.map((item, index) => {
                            const f2items = matchingCodes.filter(f1 =>
                                !f1.F2_Code.endsWith("00") &&
                                f1.F2_Code.startsWith(item.F1_Code)
                                // && !f1.New_Code
                            );

                            return (
                                <React.Fragment key={item.code}>
                                    {userRole === 'Maker' ? renderHierarchy([item], 'f1', 10, index1, index, indexval) :
                                      readHierarchy([item], 'f1', 10, index1, index, indexval)  }

                                    {f2items && f2items.map((level2, subIndex) => (
                                        <React.Fragment key={level2.code}>
                                            {userRole === 'Maker' ? renderHierarchy([level2], 'f2', 50, index1, index, subIndex, indexval) :
                                            readHierarchy([level2], 'f2', 50, index1, index, subIndex, indexval) 
                
                                            }
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        // Render a single default row if f1items is empty
                        <React.Fragment>
                            {userRole === 'Maker' ? renderHierarchy(
                                [newItems[index]],
                                'f1',
                                10,
                                index1
                            ) :
                            readHierarchy(
                                [newItem[index]],
                                'f1',
                                10,
                                index1
                            ) 
                            }
                            {/* {FItem.push(newItem)} */}
                        </React.Fragment>
                    )}

                </tbody>
            </table>
        );

    }

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
                <span>A-Available | P-Partly available | C-Customizable | N-Not available</span>
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
                                                                {Tables(l2, index1, "f1", index, userRole)}
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
                    rfp_title: sidebarValue[0].rfp_title
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
                    rfp_title: sidebarValue[0].rfp_title
                })}>
                    Save as Draft
                </button>
            )}
        </div>
    );
};



export default RFPReqTable;