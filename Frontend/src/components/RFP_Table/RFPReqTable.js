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
    console.log("userRole : "+userRole+"userPower :" +userPower)

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

    
  const currentLevel = () => {
    console.log("vuserRole : "+userRole)
    switch (true) {
      case userPower === "User" && userRole === "Maker":
        return 1;
      case userPower === "User" && userRole === "Authorizer":
        return 2;
      case userPower === "User" && userRole === "Reviewer":
        return 3;
      case userPower === "Super Admin" || userRole === "Super Admin":
        return 4;
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
    if (userPower === "Super Admin") return 5;
    if (userPower === "Vendor User" && userRole === "Maker") return 6;
    if (userPower === "Vendor User" && userRole === "Authorizer") return 7;
    if (userPower === "Vendor User" && userRole === "Reviewer") return 8;
    if (userPower === "Vendor Admin") return 4;
    return 5;
  };
  const adjustStageAndStatus = (payload, action, data) => {
    if (action === "Save as Draft") {
      payload.stage = "Draft";
      payload.Status = "Draft";
      payload.assigned_to = null;
    } else if (["Submit", "Approve", "Submit to Bank"].includes(action)) {
        console.log(nextStatus())
        payload.Status = nextStatus();
      payload.assigned_to = data.assignedTo || null;
    } else if (action === "Reject") {
      payload.stage = "Rejected";
      payload.Status = "Rejected";
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
      rfp_no: sidebarValue[0]?.rfp_no || '',
      rfp_title: sidebarValue[0]?.rfp_title || '',
      bank_name: userPower === "User" ? sidebarValue[0]?.entity_name || '' : '',
      vendor_name: userPower === "User" ? "" : sidebarValue[0]?.entity_name || '',
      created_by: userName,
      level: determineLevel(),
      Comments: data.comments || "",
      Priority: data.priority || "Medium",
      Handled_by: [{ name: userName, role: userRole }],
      Action_log: `${action} by ${userName} on ${new Date().toISOString()}`,
    };
  
    payload = adjustStageAndStatus(payload, action, data);
    console.log("Constructed Payload:", payload);
    return payload;
  };
  
 
  console.log(determineLevel())
  
  
  



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
                               Number(existingItem.New_Code) >= Number(item.New_Code+1))
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


    const renderHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
        // console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array
        // console.log("levelData");
        // console.log(levelData);
        
        return levelData.map((item, index) =>{
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
                <td style={{  paddingLeft: `${paddingLeft}px` }}>
                    {!item.deleted && item.isEditing ? (
                        <input
                            type="text"
                            value={item.name}
                            placeholder='New Item'
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
                                // fontWeight: levelType === 'f1' ? 550 : 'normal',
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
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                            checked={item.Mandatory === 1 || item.Mandatory}
                            onChange={() => handleMandatoryChange(true, item, TableIndex, parentIndex, subIndex, index)}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                            checked={item.Mandatory === 0 || !item.Mandatory}
                            onChange={() => handleMandatoryChange(false, item, TableIndex, parentIndex, subIndex, index)}
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
                    {item.Modified_Time && (
                        <p style={{
                            fontSize: '12px', wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}
                        >
                            {formattedDate} </p>)}
                </td>
                <td>
                    {item.Modified_Time &&
                        <p style={{ fontSize: '12px' }}>{item.Edited_By}</p>
                    }
                </td>
            </tr>
        )});
    };
    const readHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
        console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

        return levelData.map((item, index) => {
            const formatter = new Intl.DateTimeFormat('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full',
                timeStyle: 'long'
            });
            const formattedDate = new Date(item.Modified_Time);
            console.log(formattedDate);
            const date = new Date(item.Modified_Time);  // Assuming it's UTC
            const formattedDate1 = date.toUTCString();   // Show as UTC
            console.log("UTC Date:", formattedDate1)

            
            return (
            <tr key={`${item.Module_Code}-${item.F2_Code}-${index}`} id={`${item.Module_Code}-${item.F2_Code}-${index}`}>
     
                <td style={{ fontWeight: 'normal', paddingLeft: `${paddingLeft}px` }}>
                    <span  style={{
                                fontWeight: levelType === 'f1' ? 300 : 'normal',
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
                    <p>{item.Comments || ''}</p>    
                </td>
                <td>
                    {item.Modified_Time && (
                        <p style={{
                            fontSize: '12px', wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}
                        >
                            {item.Modified_Time} </p>)}
                </td>
                <td>
                    {item.Modified_Time &&
                        <p style={{ fontSize: '12px' }}>{item.Edited_By}</p>
                    }
                </td>
            </tr>
        )});
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
        let newItems;
        if(userRole==="Maker"){
            newItems = {
                F2_Code: '1000',
                F1_Code: `10`,
                name: "Add here...",
                Module_Code: l2.code
            };
        } else{
            newItems = {
                F2_Code: '1000',
                F1_Code: `10`,
                name: "No Items",
                Module_Code: l2.code
            };
        }
         

        console.log(FItem);
        // console.log(newItems);
        // console.log(newItems[index]);

    
        const matchingCodes = FItem?.filter(f => f?.Module_Code?.startsWith(l2.code)) || [];
        const f1items = matchingCodes
    .filter(f1 => f1?.F2_Code?.endsWith("00")) 
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
    console.log(f1items)
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
            {/* {(userRole === "Authorizer" || userRole === "Reviewer") && (
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
            )} */}

            {/* Optional Save as Draft button for Maker */}
            {/* {userRole === "Maker" && (
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
            )} */}

            {/* Show Submit button only for Authorizer or Reviewer */}
            {(userRole === "Authorizer" || userRole === "Reviewer") && (
                <button onClick={() => handleSave(constructPayload("Submit",{}))}>
                    Submit
                </button>
            )}

            {/* Optional Save as Draft button for Maker */}
            {userRole === "Maker" && (
                <button onClick={() => handleSave(constructPayload("Save as Draft",{}))}>
                    Save as Draft
                </button>
            )}
             {userRole === "Maker" && (
                <button onClick={() => handleSave(constructPayload("Submit",{}))}>
                    Submit
                </button>
            )}

        </div>
    );
};



export default RFPReqTable;