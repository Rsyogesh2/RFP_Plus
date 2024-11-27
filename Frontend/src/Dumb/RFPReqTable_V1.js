import React, { useState, useEffect, useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

import Button from '../Buttons/Button.js';
// import sendCheckedItems from '../../services/Apis'

const RFPReqTable = () => {

    const [itemData, setItemData] = useState(null); // Initially, no data
    // const [item, setItem] = useState(null); // Initially, no data
    const [reqItemData, setReqItemData] = useState(); // Initially, no data

    const { moduleData } = useContext(AppContext); // Access shared state
    console.log(moduleData);


    useEffect(() => {
        // Define an async function to log array and set item data
        async function fetchArray() {
            const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
            console.log("result", result.l1); // Log the resolved array
            setItemData(result.l1); // Set the resolved data to local state
            // setItem(result.l1);
        }

        // Call logArray when moduleData changes
        if (moduleData) {
            fetchArray();
        }
    }, [moduleData]);
    // moduleData.then((result) => {
    //   console.log(result); // This will log the resolved array to the console
    //   setItemData(result); 
    // });


    const handleCheckboxChange = (levelType, l1, l2, index) => {
        setItemData((prevItems) => {
            // Deep clone the array to avoid mutating state directly
            const updatedItems = JSON.parse(JSON.stringify(prevItems));
    
            if (levelType === 'l3') {
                // Toggle checkbox at level 1
                updatedItems[index].checked = !updatedItems[index].checked;
            } else if (levelType === 'f1') {
                // Toggle checkbox at level 2
                updatedItems[0].l2[l1].l3[l2].checked = !updatedItems[0].l2[l1].l3[l2].checked;
                // updatedItems[l1].l2[l2].checked = !updatedItems[l1].l2[l2].checked;
            } else if (levelType === 'f2') {
                // Toggle checkbox at level 3
                updatedItems[l1].l2[l2].l3[index].checked = !updatedItems[l1].l2[l2].l3[index].checked;
            }
    
            return updatedItems;
        });
    };
    
    // Add this within your component (RFPReqTable)
    
    const handleEditToggle = (levelType, l1, l2, index) => {
        console.log("levelType: "+levelType," l1: "+l1," l1: "+l2," index: "+index)
        // item[0].l2[0].l3[0].name
    setItemData((prevItems) => {
        const updatedItems = JSON.parse(JSON.stringify(prevItems));
        console.log(updatedItems);
        console.log( updatedItems[0].l2[l1].l3[l2].name);
    
        if (levelType === 'l2') {
            updatedItems[l1].l2[index].isEditing = !updatedItems[l1].l2[index].isEditing;
        } else if (levelType === 'f1') {
            updatedItems[0].l2[l1].l3[l2].isEditing = !updatedItems[0].l2[l1].l3[l2].isEditing;
        }
    
        return updatedItems;
    });
    };
    
    const handleDelete = (levelType, l1, l2, index) => {
        setItemData((prevItems) => {
            // Deep clone prevItems to avoid direct state mutation
            const updatedItems = JSON.parse(JSON.stringify(prevItems));
    
            if (levelType === 'l2') {
                // For `l2` level: remove item at `index` from the `l2` array at `l1`
                updatedItems[l1].l2 = updatedItems[l1].l2.filter((_, i) => i !== index);
            } else if (levelType === 'f1') {
                console.log( updatedItems[0].l2[l1].l3,l2);
                // For `f1` level: remove item at `index` from the `l3` array in `l2` at indices `l1` and `l2`
                updatedItems[0].l2[l1].l3 = updatedItems[0].l2[l1].l3.filter((_, i) => i !== l2);
            }
    
            // Return the modified items array to update the state
            return updatedItems;
        });
    };
    
    
    const handleAdd = (levelType, l1, l2) => {
    setItemData((prevItems) => {
        const updatedItems = JSON.parse(JSON.stringify(prevItems));
        const newItem = { name: 'New Item', code: Date.now().toString(), isEditing: true };
    
        if (levelType === 'l2') {
            if (!updatedItems[l1].l2) {
                updatedItems[l1].l2 = [];
            }
            updatedItems[l1].l2.push(newItem);
        } else if (levelType === 'f1') {
            if (!updatedItems[0].l2[l1].l3[l2]) {
                updatedItems[0].l2[l1].l3[l2] = [];
            }
            // updatedItems[0].l2[l1].l3.push(newItem);
            updatedItems[0].l2[l1].l3.splice(l2 + 1, 0, newItem);
        }
    
        return updatedItems;
    });
    };
    
    const handleNameChange = (e, levelType, l1, l2, index) => {
    const newName = e.target.value;
    setItemData((prevItems) => {
        const updatedItems = JSON.parse(JSON.stringify(prevItems));
    
        if (levelType === 'l3') {
            updatedItems[index].name = newName;
        } else if (levelType === 'f1') {
            updatedItems[0].l2[l1].l3[l2].name = newName;
        } else if (levelType === 'f2') {
            updatedItems[l1].l2[l2].l3[index].name = newName;
        }
    
        return updatedItems;
    });
    };
    
    
    const renderHierarchy = (levelData, levelType, paddingLeft = 0, parentIndex = null, subIndex = null) => {
        // console.log('Rendering level:', levelType, 'with data:', levelData);
    
        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

        return levelData.map((item, index) => (
            <tr key={`${item.code}-${index}`}>
                {/* Checkbox for l2 and l3 levels */}
                <td style={{ paddingLeft: `${paddingLeft}px` }}>
                    {levelType !== 'l3' && (
                        <input
                            type="checkbox"
                            checked={item.checked || false}
                            onChange={() => handleCheckboxChange(levelType, parentIndex, subIndex, index)}
                        />
                    )}
                </td>

                {/* Edit button for l2 and l3 levels */}
                <td>
                {levelType !== 'l3' && (
                    <>
                        <button onClick={() => handleEditToggle(levelType, parentIndex, subIndex, index)}>
                            {item.isEditing ? "Save" : "Edit"}
                        </button>
                        <button onClick={() => handleDelete(levelType, parentIndex, subIndex, index)}>
                            Delete
                        </button>
                        <button onClick={() => handleAdd(levelType, parentIndex, subIndex)}>
                            Add
                        </button>
                    </>
                )}
                </td>

                {/* Display name, bold for l1 level */}
                <td style={{ fontWeight: 'normal'}}>
                    {item.isEditing ? (
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleNameChange(e, levelType, parentIndex, subIndex, index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleEditToggle(levelType, parentIndex, subIndex, index);
                                }
                            }}
                        />
                    ) : (
                        levelType === 'l3' ? <strong>{item.name}</strong> : item.name
                    )}
                </td>

                {/* M and O radio buttons for l2 and l3 levels */}
                <td>
                    {levelType !== 'l3' && (
                        <input
                            type="radio"
                            name={`${item.F2_Code}-MorO`}
                            checked={item.MorO === 'M'}
                        // onChange={() => handleMorOChange(levelType, parentIndex, subIndex, index, 'M')}
                        />
                    )}
                </td>
                <td>
                    {levelType !== 'l3' && (
                        <input
                            type="radio"
                            name={`${item.F2_Code}-MorO`}
                            checked={item.MorO === 'O'}
                        // onChange={() => handleMorOChange(levelType, parentIndex, subIndex, index, 'O')}
                        />
                    )}
                </td>

                {/* Comments input for l2 and l3 levels */}
                <td>
                    {levelType !== 'l3' && (
                        <input
                            type="text"
                            value={item.comments || ''}
                        // onChange={(e) => handleCommentsChange(e, levelType, parentIndex, subIndex, index)}
                        />
                    )}
                </td>
            </tr>
        ));
    };

    const renderTableL2 =(items,index)=>{
        console.log(items.name)
        return (
        <table className="item-table">
                <thead>
                    <tr>
                        <th>+/-</th>
                        <th>Edit</th>
                        <th>Requirement</th>
                        <th>M</th>
                        <th>O</th>
                        <th>Comments</th>
                        {/* <th>Score</th> */}
                    </tr>
                </thead>
                <tbody>
                    {items.l2.map((item, index) => (
                    <React.Fragment key={item.code}>
                        {renderHierarchy([item], 'l3')}
                        {item.l3 && item.l3.map((level2, subIndex) => (
                            <React.Fragment key={level2.code}>
                                {renderHierarchy([level2], 'f1', 20, index, subIndex)}
                                {level2.l3 && renderHierarchy(level2.l3, 'f2', 40, index, subIndex)}
                            </React.Fragment>
                        ))}
                         {/* <Button text="Save as Draft" type="submit" />
                         <Button text="Submit" type="submit" /> */}
                    </React.Fragment>
                    
                ))}
                </tbody>
                </table>  
        );
    }

    return (
        <div className="rfp-table">
            <div className="header">
                <div className="title">
                    <span>RFP No: {123456}  </span>
                    <span>RFP Title: {"Customer Onboarding"}</span>
                </div>
            </div>
            <div className="labels">
                <span>M-Mandatory | O-Optional </span>
                <span>A-Available | P-Partly available | C-Customizable | N-Not available</span>
            </div>
            <div className="module-header">
                <span>1.1. Module L2</span>
            
            {itemData && itemData.length > 0 && (
                <div>
                        {itemData.map((item, index) => renderTableL2(item,index))}
                </div>
            )}
            </div>
            
            {/* <Button  text="Save as Draft" type="submit" />
            <Button text="Submit" type="submit" /> */}

        </div>
    );
};

export default RFPReqTable;

const renderTable =(items,Mindex,l)=>{
    console.log("renderTable");
    // console.log(items);
    // console.log(FItem);
    const matchingCodes = FItem.filter(f => f.Module_Code.startsWith(items.code));
    // console.log(matchingCodes);
    const f1items = matchingCodes.filter(f1=>f1.F2_Code.endsWith("00"))
    // console.log(f1items);
    // const f2items = matchingCodes.filter(f1=>!(f1.F2_Code.endsWith("00"))&&f1.F2_Code!==""&&f1.F2_Code.startsWith(f1.F1_Code))
    // console.log(f2items);
    return (
    <table className="item-table">
            <thead>
                <tr>
                    <th>Modify</th>
                    <th>Requirement</th>
                    <th>M</th>
                    <th>O</th>
                    <th>Comments</th>
                    {/* <th>Score</th> */}
                </tr>
            </thead>
            <tbody>
                {/* {items[l]&&items[l].map((item, index) => ( */}
                {f1items&&f1items.map((item, index) => {
                    const f2items = matchingCodes.filter(f1 => 
                        !f1.F2_Code.endsWith("00")  &&
                        // f1.F2_Code !== "" &&
                        f1.F2_Code.startsWith(item.F1_Code)
                    );
                    // console.log(item);
                    // console.log(f2items);
                    return(
                <React.Fragment key={item.code}>
                    {renderHierarchy([item], 'f1',10,Mindex,index)}
                    
                    {f2items && f2items.map((level2, subIndex) => (
                        <React.Fragment key={level2.code}>
                            {renderHierarchy([level2], 'f2', 50, Mindex,index,subIndex)}
                            {/* {level2.l3 && renderHierarchy(level2.l3, 'f2', 40, index, subIndex)} */}
                        </React.Fragment>
                    ))}
                     {/* <Button text="Save as Draft" type="submit" />
                     <Button text="Submit" type="submit" /> */}
                </React.Fragment>
                    )
})}
            </tbody>
            </table>  
    );
}


const renderHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex=null,parentIndex = null, subIndex = null) => {
    // console.log('Rendering level:', levelType, 'with data:', levelData);

    if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

    return levelData.map((item, index) => (
        <tr key={`${item.F2_Code}-${index}`} id={`${item.F2_Code}-${index}`}>

            {/* Checkbox for l2 and l3 levels */}

            {/* Edit button for l2 and l3 levels */}
            <td>
            {levelType !== 'l3' && (
               <div key={item.code} style={{ display: 'flex', gap: '0px' }}>
                    <button className='Modifybtn'
                    onClick={(e) => handleEditToggle(item,e)}>
                        {item.isEditing ? "S" : "E"}
                    </button>
                    <button  className='Modifybtn' onClick={() => handleDelete(item)}>
                        D
                    </button>
                    <button className='Modifybtn'  onClick={() => handleAdd(item)}>
                        A
                    </button>
                </div>
            )}
            </td>

            {/* Display name, bold for l1 level */}
            <td style={{ fontWeight: 'normal', paddingLeft: `${paddingLeft}px` }}>
                {item.isEditing ? (
                    <input
                        type="text"
                        value={item.name}
                        onChange={handleNameChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleEditToggle(item,e);
                            }
                        }}
                    />
                ) : (
                    levelType === 'f1' ? <span style={{ fontWeight: 500 }}>{item.name}</span>
                    : item.name
                )}
            </td>

            {/* M and O radio buttons for l2 and l3 levels */}
            <td>
                {
                    <input
                        type="radio"
                        name={`${item.F2_Code}-${TableIndex}-${index}-MorO`}
                        checked={item.MorO === true}
                    onChange={() => handleMorOChange(true,item,TableIndex,parentIndex,subIndex,index)}
                    />
                }
            </td>
            <td>
                {
                    <input
                        type="radio"
                        name={`${item.F2_Code}-${TableIndex}-${index}-MorO`}
                        checked={item.MorO === false}
                        onChange={() => handleMorOChange(false,item,TableIndex,parentIndex,subIndex,index)}
                    />
                }
            </td>

            {/* Comments input for l2 and l3 levels */}
            <td>
                    <input
                        type="text"
                        value={item.Comments || ''}
                     onChange={(e) => handleCommentsChange(e,item)}
                    />
                
            </td>
        </tr>
    ));
};